import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Restaurant } from '../models/Restaurant.js';
import { changeOrderStatus, placeOrder } from '../services/order.service.js';
import { AppError } from '../utils/AppError.js';

// The café details the order status page shows. No UPI ID yet (paying arrives with step 1.7).
const restaurantForOrder = (restaurant) =>
  restaurant
    ? { name: restaurant.name, slug: restaurant.slug, logoUrl: restaurant.toCustomer().logoUrl }
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

// ---- Kitchen (owner login): orders are always looked up with the token's restaurantId ----

// The kitchen board can show many orders at once; more than this means something is stuck.
const KITCHEN_LIMIT = 100;

// GET /api/orders?status=new — the kitchen board, oldest first.
export async function getKitchenOrders(req, res) {
  const orders = await Order.find({
    restaurantId: req.auth.restaurantId,
    status: mongoose.trusted({ $in: req.valid.query.status }),
  })
    .sort({ createdAt: 1 })
    .limit(KITCHEN_LIMIT);
  res.json({ orders: orders.map((order) => order.toKitchen()) });
}

// PATCH /api/orders/:id/ready — the one kitchen tap.
export async function markOrderReady(req, res) {
  const order = await changeOrderStatus({
    restaurantId: req.auth.restaurantId,
    orderId: req.valid.params.id,
    status: 'ready',
  });
  res.json({ order: order.toKitchen() });
}

// PATCH /api/orders/:id/cancel — the café cannot make an order (asked to confirm first).
export async function cancelOrder(req, res) {
  const order = await changeOrderStatus({
    restaurantId: req.auth.restaurantId,
    orderId: req.valid.params.id,
    status: 'cancelled',
  });
  res.json({ order: order.toKitchen() });
}
