import { request } from './client.js';

// order: { customerName, items: [{ menuItemId, qty }] }. Prices are worked out by the server.
export const placeOrder = (slug, deviceId, order) =>
  request(`/api/public/${encodeURIComponent(slug)}/orders`, {
    method: 'POST',
    deviceId,
    body: order,
  });

// Only the phone that placed the order can read it.
export const getMyOrder = (orderId, deviceId, options) =>
  request(`/api/public/orders/${encodeURIComponent(orderId)}`, { deviceId, ...options });
