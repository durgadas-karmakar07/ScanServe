import { request } from './client.js';

// Without an ID the server makes a new device; with one it confirms it (or replaces an unknown
// one). Returns { device: { deviceId, name } }.
export const registerDevice = (deviceId) =>
  request('/api/devices', { method: 'POST', body: deviceId ? { deviceId } : {} });
