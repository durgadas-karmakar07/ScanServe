import mongoose from 'mongoose';
import { OPEN_ORDER_STATUSES, Order } from '../models/Order.js';
import { Restaurant } from '../models/Restaurant.js';
import { changeOrderStatus, placeOrder } from '../services/order.service.js';
import { AppError } from '../utils/AppError.js';

// The café details the order status page shows, including the UPI ID the customer pays to
// (the amount always comes from the order on the server).
const restaurantForOrder = (restaurant) =>
  restaurant
    ? {
        name: restaurant.name,
        slug: restaurant.slug,
        upiId: restaurant.upiId,
        logoUrl: restaurant.toCustomer().logoUrl,
      }
    : null;

// POST /api/public/:slug/orders — a customer places an order from their phone.
// A repeated checkout id answers 200 with the order already saved instead of making a new one.
export async function createOrder(req, res) {
  const { order, restaurant, isRepeat } = await placeOrder({
    slug: req.valid.params.slug,
    deviceId: req.device.deviceId,
    customerName: req.valid.body.customerName,
    lines: req.valid.body.items,
    checkoutId: req.valid.body.checkoutId,
  });
  res
    .status(isRepeat ? 200 : 201)
    .json({ order: order.toCustomer(), restaurant: restaurantForOrder(restaurant) });
}

// GET /api/public/:slug/orders/mine — this phone's open orders at this café (waiting or ready,
// not paid), newest first, so the menu can link to each one, even after the phone forgot them.
export async function getMyOpenOrders(req, res) {
  const restaurant = await Restaurant.findOne({ slug: req.valid.params.slug });
  if (!restaurant) {
    throw new AppError(404, 'RESTAURANT_NOT_FOUND', 'This café was not found. Check the QR code.');
  }
  const orders = await Order.find({
    restaurantId: restaurant._id,
    deviceId: req.device.deviceId,
    status: mongoose.trusted({ $in: OPEN_ORDER_STATUSES }),
  })
    .sort({ createdAt: -1 })
    .limit(10);
  res.json({ orders: orders.map((order) => order.toCustomer()) });
}

// GET /api/public/orders/:id — only the phone that placed the order can see it. Someone else's
// order id gives 404, the same as an id that does not exist, so ids cannot be probed.
export async function getMyOrder(req, res) {
  const order = await Order.findOne({ _id: req.valid.params.id, deviceId: req.device.deviceId });
  if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'This order was not found on this phone.');

  const restaurant = await Restaurant.findById(order.restaurantId);
  res.json({ order: order.toCustomer(), restaurant: restaurantForOrder(restaurant) });
}

// POST /api/public/orders/:id/paid — the customer says they paid (UPI or cash), after the order
// is ready. Pay-after-eating is trust-based; the owner sees it leave the unpaid list.
export async function markMyOrderPaid(req, res) {
  const order = await changeOrderStatus({
    orderId: req.valid.params.id,
    status: 'paid',
    scope: { deviceId: req.device.deviceId },
    changes: { paymentMethod: req.valid.body.method, paidMarkedBy: 'customer' },
  });
  const restaurant = await Restaurant.findById(order.restaurantId);
  res.json({ order: order.toCustomer(), restaurant: restaurantForOrder(restaurant) });
}

// ---- Kitchen and owner (owner login): orders are always looked up with the token's café ----

// A list never sends more than this; count and amount always cover every matching order, and
// hasMore tells the screen to say that some are not shown.
const LIST_LIMIT = 200;

// GET /api/orders?status=new — the kitchen board (oldest first);
// ?status=ready&order=newest — the unpaid list (newest first).
export async function getKitchenOrders(req, res) {
  const { status, order } = req.valid.query;
  const filter = { restaurantId: req.auth.restaurantId, status: mongoose.trusted({ $in: status }) };
  const [orders, count, totals] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: order === 'newest' ? -1 : 1 })
      .limit(LIST_LIMIT),
    Order.countDocuments(filter),
    // Aggregation filters are not cast or sanitized by Mongoose, so the id is converted here and
    // the statuses are the checked values from the validator.
    Order.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(req.auth.restaurantId),
          status: { $in: status },
        },
      },
      { $group: { _id: null, amount: { $sum: '$total' } } },
    ]),
  ]);
  res.json({
    orders: orders.map((item) => item.toKitchen()),
    count,
    amount: totals[0]?.amount ?? 0,
    hasMore: count > orders.length,
  });
}

const changeForCafe = (req, status, { changes, onlyFrom } = {}) =>
  changeOrderStatus({
    orderId: req.valid.params.id,
    status,
    scope: { restaurantId: req.auth.restaurantId },
    changes,
    onlyFrom,
  });

// PATCH /api/orders/:id/ready — the one kitchen tap.
export async function markOrderReady(req, res) {
  const order = await changeForCafe(req, 'ready');
  res.json({ order: order.toKitchen() });
}

// PATCH /api/orders/:id/cancel — the café cannot make an order (asked to confirm first). Only
// for orders not made yet: a Cancel from a stale screen cannot undo a Ready (food served).
export async function cancelOrder(req, res) {
  const order = await changeForCafe(req, 'cancelled', { onlyFrom: ['new'] });
  res.json({ order: order.toKitchen() });
}

// PATCH /api/orders/:id/mark-paid — the owner marks a ready order paid (UPI or cash).
export async function markOrderPaid(req, res) {
  const order = await changeForCafe(req, 'paid', {
    changes: { paymentMethod: req.valid.body.method, paidMarkedBy: 'owner' },
  });
  res.json({ order: order.toKitchen() });
}
