import { request } from './client.js';

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const getUploadSignature = (token, kind) =>
  request('/api/uploads/signature', { method: 'POST', token, body: { kind } });

const uploadError = (message) => Object.assign(new Error(message), { code: 'UPLOAD_FAILED' });

// Sends the file straight to Cloudinary with the short-lived signature from our API; the API
// secret never reaches the browser. Returns what the API stores: { publicId, version }.
export async function uploadToCloudinary(file, { cloudName, apiKey, signature, params }) {
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', apiKey);
  form.append('signature', signature);
  Object.entries(params).forEach(([key, value]) => form.append(key, String(value)));

  let response;
  try {
    response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
      { method: 'POST', body: form },
    );
  } catch {
    throw uploadError('Could not upload the photo. Check your internet and try again.');
  }

  const data = await response.json().catch(() => null);
  // 401 means Cloudinary refused our signature (wrong keys on the server), not the photo.
  if (response.status === 401) {
    throw uploadError('Photo upload is not set up correctly yet. Please try again later.');
  }
  if (!response.ok || !data?.public_id) {
    throw uploadError('The photo could not be uploaded. Use a JPG, PNG or WebP photo under 5 MB.');
  }
  return { publicId: data.public_id, version: data.version };
}
