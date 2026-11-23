import { request } from './client.js';

export const updateRestaurant = (token, changes) =>
  request('/api/restaurant', { method: 'PATCH', token, body: changes });
