import crypto from 'node:crypto';
import { env } from '../config/env.js';

// Photos are uploaded by the browser straight to Cloudinary with a short-lived signature from
// our API, so the API secret never leaves the server and files never pass through Render.

export const isPhotoUploadEnabled = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
);

export const PHOTO_KINDS = ['dish', 'cover', 'logo'];

// Every café uploads into its own folder; a photo id from another folder is refused.
export const photoFolder = (restaurantId, kind) =>
  `scanserve/${env.NODE_ENV}/${restaurantId}/${kind}`;

export const isOwnPhoto = (publicId, restaurantId, kind) =>
  publicId.startsWith(`${photoFolder(restaurantId, kind)}/`);

// Cloudinary signature: params sorted by name as "key=value" joined with "&", then the API
// secret, hashed with SHA-1.
export function signParams(params) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return crypto
    .createHash('sha1')
    .update(payload + env.CLOUDINARY_API_SECRET)
    .digest('hex');
}

// Each kind of photo is delivered at one size, in the best format the phone supports
// (f_auto) and compressed (q_auto), so a menu stays light on mobile data.
const DELIVERY = {
  dish: 'c_fill,g_auto,w_640,h_480,f_auto,q_auto',
  cover: 'c_fill,g_auto,w_1600,h_700,f_auto,q_auto',
  logo: 'c_fill,g_auto,w_256,h_256,f_auto,q_auto',
};

export function photoUrl(photo, kind) {
  if (!photo?.publicId || !env.CLOUDINARY_CLOUD_NAME) return null;
  return `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/${DELIVERY[kind]}/v${photo.version}/${photo.publicId}`;
}

// Best effort: a photo left behind only costs storage, so a failure is logged, never shown.
export async function deletePhoto(publicId) {
  if (!isPhotoUploadEnabled || !publicId) return;
  const params = { invalidate: 'true', public_id: publicId, timestamp: nowInSeconds() };
  const body = new URLSearchParams({
    ...params,
    api_key: env.CLOUDINARY_API_KEY,
    signature: signParams(params),
  });
  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/destroy`,
      { method: 'POST', body },
    );
    if (!res.ok) console.warn(`Cloudinary could not delete ${publicId} (status ${res.status})`);
  } catch (err) {
    console.warn(`Cloudinary could not delete ${publicId}: ${err.message}`);
  }
}

export const nowInSeconds = () => Math.floor(Date.now() / 1000);
