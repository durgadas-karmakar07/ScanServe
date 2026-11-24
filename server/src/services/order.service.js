import mongoose from 'mongoose';
import { Device } from '../models/Device.js';
import { MenuItem } from '../models/MenuItem.js';
import { OPEN_ORDER_STATUSES, Order } from '../models/Order.js';
import { Restaurant } from '../models/Restaurant.js';
import { emitToDevice, emitToKitchen } from '../socket/emit.js';
import { AppError } from '../utils/AppError.js';
import { businessDate, nextOrderNumber } from './counter.service.js';

// Rules.md section 5: at most 2 orders waiting per phone.
export const MAX_OPEN_ORDERS = 2;
// Long enough for one order to be saved; a lock left by a crash ends by itself.
const ORDER_LOCK_MS = 10_000;

// mongoose.set('sanitizeFilter', true) turns operators in filters into plain values, to stop
// injection from request data. Operators written here in code are marked as trusted.
const { trusted } = mongoose;

const joinNames = (names) =>
  names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;

// One phone places one order at a time: this takes a short lock on the device, so a double
// tap or two tabs cannot create two orders or get past MAX_OPEN_ORDERS. Returns the lock's end
// time, which identifies this request's lock.
async function lockDevice(deviceId, now) {
  const lockUntil = new Date(now.getTime() + ORDER_LOCK_MS);
  const device = await Device.findOneAndUpdate(
    {
      deviceId,
      $or: [{ orderLockUntil: null }, { orderLockUntil: trusted({ $lte: now }) }],
    },
    { $set: { orderLockUntil: lockUntil } },
  );
  if (!device) {
    throw new AppError(
      409,
      'ORDER_IN_PROGRESS',
      'Your order is already being placed. Please wait a moment.',
    );
  }
  return lockUntil;
}

// Releases only this request's own lock: if it ran past ORDER_LOCK_MS and another request has
// since taken a new lock, that newer lock is left alone.
const unlockDevice = (deviceId, lockUntil) =>
  Device.updateOne({ deviceId, orderLockUntil: lockUntil }, { $set: { orderLockUntil: null } });

// Places an order from the customer's cart. Prices, names and the total always come from the
// menu in the database; the phone only says which dishes and how many.
export async function placeOrder({ slug, deviceId, customerName, lines }) {
  const restaurant = await Restaurant.findOne({ slug });
  if (!restaurant) {
    throw new AppError(404, 'RESTAURANT_NOT_FOUND', 'This café was not found. Check the QR code.');
  }
  if (!restaurant.isAcceptingOrders) {
    throw new AppError(409, 'NOT_ACCEPTING_ORDERS', 'This café is not taking orders right now.');
  }

  const now = new Date();
  const lockUntil = await lockDevice(deviceId, now);
  try {
    const openOrders = await Order.countDocuments({
      deviceId,
      status: trusted({ $in: OPEN_ORDER_STATUSES }),
    });
    if (openOrders >= MAX_OPEN_ORDERS) {
      throw new AppError(
        409,
        'TOO_MANY_OPEN_ORDERS',
        `You already have ${MAX_OPEN_ORDERS} orders waiting. Collect and pay for one before ordering again.`,
      );
    }

    const dishes = await MenuItem.find({
      _id: trusted({ $in: lines.map((line) => line.menuItemId) }),
      restaurantId: restaurant._id,
    });
    const dishById = new Map(dishes.map((dish) => [dish.id, dish]));
    if (lines.some((line) => !dishById.has(line.menuItemId))) {
      throw new AppError(
        409,
        'MENU_CHANGED',
        'Some dishes are no longer on the menu. We have updated it, so please check your order.',
      );
    }
    const soldOut = lines
      .map((line) => dishById.get(line.menuItemId))
      .filter((dish) => !dish.isAvailable);
    if (soldOut.length > 0) {
      const names = joinNames(soldOut.map((dish) => dish.name));
      throw new AppError(
        409,
        'ITEM_UNAVAILABLE',
        `Sorry, ${names} ${soldOut.length === 1 ? 'is' : 'are'} sold out. We have updated the menu, so please check your order.`,
      );
    }

    const items = lines.map((line) => {
      const dish = dishById.get(line.menuItemId);
      return { menuItemId: dish._id, name: dish.name, price: dish.price, qty: line.qty };
    });
    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const date = businessDate(now);
    const orderNumber = await nextOrderNumber(restaurant._id, date);

    const order = await Order.create({
      restaurantId: restaurant._id,
      deviceId,
      customerName,
      orderNumber,
      businessDate: date,
      items,
      total,
    });
    await Device.updateOne({ deviceId }, { $set: { name: customerName, lastSeenAt: now } });
    emitToKitchen(restaurant._id, 'order:new', order.toKitchen());
    return { order, restaurant };
  } finally {
    await unlockDevice(deviceId, lockUntil);
  }
}

// Rules.md section 5: the only status changes allowed are new -> ready -> paid and
// new|ready -> cancelled (paid arrives with step 1.7). Each target lists the statuses it may
// come from.
const ALLOWED_FROM = {
  ready: ['new'],
  cancelled: ['new', 'ready'],
};
const TIME_FIELD = { ready: 'readyAt', cancelled: 'cancelledAt' };
const STATUS_WORDS = { new: 'new', ready: 'ready', paid: 'paid', cancelled: 'cancelled' };

// Tells the kitchen screens and the customer's phone what changed. The phone refetches its
// order over REST; these events only say "look again".
function announceStatus(order) {
  const event = order.status === 'ready' ? 'order:ready' : 'order:cancelled';
  const payload =
    order.status === 'ready'
      ? { orderId: order.id, orderNumber: order.orderNumber }
      : { orderId: order.id };
  emitToKitchen(order.restaurantId, event, payload);
  emitToDevice(order.deviceId, event, payload);
}

// Every order status change goes through here. One atomic update that only matches allowed
// starting statuses, so a Ready and a Cancel tapped at the same moment cannot both win. Doing
// the same thing twice (a double tap) is harmless and returns the order unchanged.
export async function changeOrderStatus({ restaurantId, orderId, status }) {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, restaurantId, status: trusted({ $in: ALLOWED_FROM[status] }) },
    { $set: { status, [TIME_FIELD[status]]: new Date() } },
    { returnDocument: 'after' },
  );
  if (order) {
    announceStatus(order);
    return order;
  }

  // Nothing changed: the order is missing (or another café's), already done, or not allowed.
  const current = await Order.findOne({ _id: orderId, restaurantId });
  if (!current) throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found.');
  if (current.status === status) return current;
  throw new AppError(
    409,
    'INVALID_STATUS_CHANGE',
    `Order #${current.orderNumber} is already ${STATUS_WORDS[current.status]}.`,
  );
}
