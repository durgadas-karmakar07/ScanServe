import { MenuItem } from '../models/MenuItem.js';
import { Restaurant } from '../models/Restaurant.js';
import { AppError } from '../utils/AppError.js';

// The customer menu: anyone with the QR link can read it. Sold-out dishes are included (shown
// greyed out) so regulars do not think a dish was removed.
export async function getPublicMenu(req, res) {
  const restaurant = await Restaurant.findOne({ slug: req.valid.params.slug });
  if (!restaurant) {
    throw new AppError(404, 'RESTAURANT_NOT_FOUND', 'This café was not found. Check the QR code.');
  }

  const items = await MenuItem.find({ restaurantId: restaurant._id }).sort({
    sortOrder: 1,
    _id: 1,
  });
  res.json({
    restaurant: restaurant.toCustomer(),
    items: items.map((item) => item.toCustomer()),
  });
}
