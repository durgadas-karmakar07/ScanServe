import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
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
export async function createOrder(req, res) {
  const { order, restaurant } = await placeOrder({
    slug: req.valid.params.slug,
    deviceId: req.device.deviceId,
    customerName: req.valid.body.customerName,
    lines: req.valid.body.items,
  });
  res.status(201).json({ order: order.toCustomer(), restaurant: restaurantForOrder(restaurant) });
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

// The board can show many orders at once; more than this means something is stuck.
const KITCHEN_LIMIT = 100;

// GET /api/orders?status=new — the kitchen board; ?status=ready — the unpaid list. Oldest first.
export async function getKitchenOrders(req, res) {
  const orders = await Order.find({
    restaurantId: req.auth.restaurantId,
    status: mongoose.trusted({ $in: req.valid.query.status }),
  })
    .sort({ createdAt: 1 })
    .limit(KITCHEN_LIMIT);
  res.json({ orders: orders.map((order) => order.toKitchen()) });
}

const changeForCafe = (req, status, changes) =>
  changeOrderStatus({
    orderId: req.valid.params.id,
    status,
    scope: { restaurantId: req.auth.restaurantId },
    changes,
  });

// PATCH /api/orders/:id/ready — the one kitchen tap.
export async function markOrderReady(req, res) {
  const order = await changeForCafe(req, 'ready');
  res.json({ order: order.toKitchen() });
}

// PATCH /api/orders/:id/cancel — the café cannot make an order (asked to confirm first).
export async function cancelOrder(req, res) {
  const order = await changeForCafe(req, 'cancelled');
  res.json({ order: order.toKitchen() });
}

// PATCH /api/orders/:id/mark-paid — the owner marks a ready order paid (UPI or cash).
export async function markOrderPaid(req, res) {
  const order = await changeForCafe(req, 'paid', {
    paymentMethod: req.valid.body.method,
    paidMarkedBy: 'owner',
  });
  res.json({ order: order.toKitchen() });
}
