import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import {
  isPhotoUploadEnabled,
  nowInSeconds,
  photoFolder,
  signParams,
} from '../utils/cloudinary.js';

// The signature does not fix which Cloudinary endpoint is used (image, video, raw), so the
// signed allowed_formats is what refuses anything that is not a JPG, PNG or WebP photo, on
// every endpoint. (No `format` param: with it, Cloudinary converts other types instead of
// refusing them.)
const ALLOWED_FORMATS = 'jpg,jpeg,png,webp';
// On arrival every photo is shrunk to at most 1600px, compressed and stored as WebP (which keeps
// logo transparency; Cloudinary may keep a gray-only photo as JPG), so storage stays small on the
// free plan. Checked with real uploads: f_webp here converts even with allowed_formats set.
const INCOMING_TRANSFORMATION = 'c_limit,w_1600,h_1600,q_auto:good,f_webp';

// Gives the browser a signature for exactly one photo: the server picks its id inside this
// café's folder and signs overwrite=false. Cloudinary accepts a signature for about an hour,
// but replaying it on the image endpoint can only return that same photo.
export function createUploadSignature(req, res) {
  if (!isPhotoUploadEnabled) {
    throw new AppError(503, 'PHOTOS_NOT_CONFIGURED', 'Photo upload is not set up yet.');
  }

  const params = {
    allowed_formats: ALLOWED_FORMATS,
    overwrite: 'false',
    public_id: `${photoFolder(req.auth.restaurantId, req.valid.body.kind)}/${crypto.randomUUID()}`,
    timestamp: nowInSeconds(),
    transformation: INCOMING_TRANSFORMATION,
  };

  res.json({
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    signature: signParams(params),
    params,
  });
}
