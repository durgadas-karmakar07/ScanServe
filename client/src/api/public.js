import { request } from './client.js';

export const getPublicMenu = (slug, options) =>
  request(`/api/public/${encodeURIComponent(slug)}/menu`, options);
