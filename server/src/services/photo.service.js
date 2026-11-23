import { AppError } from '../utils/AppError.js';
import { deletePhoto, isOwnPhoto } from '../utils/cloudinary.js';

// Refuses a photo id from another café's folder (or another kind), so nobody can show someone
// else's upload on their menu.
export function assertOwnPhoto(photo, restaurantId, kind, field) {
  if (photo && !isOwnPhoto(photo.publicId, restaurantId, kind)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Please check the highlighted fields.', {
      [field]: 'This photo was not uploaded for your café.',
    });
  }
}

// After a photo is replaced or removed, delete the old file. Not awaited: cleaning up storage
// must never slow down or fail the owner's save.
export function removeReplacedPhoto(oldPhoto, newPhoto) {
  if (oldPhoto?.publicId && oldPhoto.publicId !== newPhoto?.publicId) {
    void deletePhoto(oldPhoto.publicId);
  }
}
