import { request } from './client.js';

export const getHealth = (options) => request('/api/health', options);
