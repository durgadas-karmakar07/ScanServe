import { request } from './client.js';

// order: { customerName, checkoutId, items: [{ menuItemId, qty }] }. Prices are worked out by
// the server; the same checkoutId again returns the order already saved.
export const placeOrder = (slug, deviceId, order) =>
  request(`/api/public/${encodeURIComponent(slug)}/orders`, {
    method: 'POST',
    deviceId,
    body: order,
  });

// Only the phone that placed the order can read it.
export const getMyOrder = (orderId, deviceId, options) =>
  request(`/api/public/orders/${encodeURIComponent(orderId)}`, { deviceId, ...options });

// ---- Kitchen (owner login) ----

// New orders, oldest first.
export const getKitchenOrders = (token, options) =>
  request('/api/orders?status=new', { token, ...options });

export const markOrderReady = (token, orderId) =>
  request(`/api/orders/${encodeURIComponent(orderId)}/ready`, { method: 'PATCH', token });

export const cancelOrder = (token, orderId) =>
  request(`/api/orders/${encodeURIComponent(orderId)}/cancel`, { method: 'PATCH', token });

// ---- Paying (step 1.7) ----

// The customer says they paid: method 'upi' or 'cash'. Only after the order is ready.
export const markMyOrderPaid = (orderId, deviceId, method) =>
  request(`/api/public/orders/${encodeURIComponent(orderId)}/paid`, {
    method: 'POST',
    deviceId,
    body: { method },
  });

// Owner: ready orders that are not paid yet, newest first.
export const getUnpaidOrders = (token, options) =>
  request('/api/orders?status=ready&order=newest', { token, ...options });

export const markOrderPaid = (token, orderId, method) =>
  request(`/api/orders/${encodeURIComponent(orderId)}/mark-paid`, {
    method: 'PATCH',
    token,
    body: { method },
  });

// This phone's open orders (waiting or ready, not paid) at a café, newest first.
export const getMyOpenOrders = (slug, deviceId, options) =>
  request(`/api/public/${encodeURIComponent(slug)}/orders/mine`, { deviceId, ...options });
