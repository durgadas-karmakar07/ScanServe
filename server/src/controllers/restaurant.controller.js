import { Restaurant } from '../models/Restaurant.js';
import { AppError } from '../utils/AppError.js';

// The café is always the one in the owner's token, never an id from the request.
export async function updateRestaurant(req, res) {
  const restaurant = await Restaurant.findById(req.auth.restaurantId);
  if (!restaurant) throw new AppError(404, 'RESTAURANT_NOT_FOUND', 'Café not found.');

  restaurant.set(req.valid.body);
  await restaurant.save();
  res.json({ restaurant: restaurant.toPublic() });
}
