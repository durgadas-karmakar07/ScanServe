import { request } from './client.js';

const itemPath = (id) => `/api/menu/${encodeURIComponent(id)}`;

export const getMenu = (token, options) => request('/api/menu', { token, ...options });

export const createMenuItem = (token, dish) =>
  request('/api/menu', { method: 'POST', token, body: dish });

export const updateMenuItem = (token, id, changes) =>
  request(itemPath(id), { method: 'PATCH', token, body: changes });

export const deleteMenuItem = (token, id) => request(itemPath(id), { method: 'DELETE', token });
