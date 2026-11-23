import { request } from './client.js';

export const registerOwner = (details) =>
  request('/api/auth/register', { method: 'POST', body: details });

export const loginOwner = (credentials) =>
  request('/api/auth/login', { method: 'POST', body: credentials });

export const getMe = (token, options) => request('/api/auth/me', { token, ...options });
