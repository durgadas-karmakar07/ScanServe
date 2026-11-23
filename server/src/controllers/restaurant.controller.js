import { Restaurant } from '../models/Restaurant.js';
import { assertOwnPhoto, removeReplacedPhoto } from '../services/photo.service.js';
import { AppError } from '../utils/AppError.js';

// The café is always the one in the owner's token, never an id from the request.
export async function updateRestaurant(req, res) {
  const { restaurantId } = req.auth;
  const changes = req.valid.body;
  assertOwnPhoto(changes.coverPhoto, restaurantId, 'cover', 'coverPhoto');
  assertOwnPhoto(changes.logo, restaurantId, 'logo', 'logo');

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new AppError(404, 'RESTAURANT_NOT_FOUND', 'Café not found.');

  const oldCover = restaurant.coverPhoto?.toObject();
  const oldLogo = restaurant.logo?.toObject();
  restaurant.set(changes);
  await restaurant.save();
  if ('coverPhoto' in changes) removeReplacedPhoto(oldCover, changes.coverPhoto);
  if ('logo' in changes) removeReplacedPhoto(oldLogo, changes.logo);
  res.json({ restaurant: restaurant.toPublic() });
}
