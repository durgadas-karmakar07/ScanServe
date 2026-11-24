import { Restaurant } from '../models/Restaurant.js';
import { Staff } from '../models/Staff.js';
import { loginOwner, registerOwner } from '../services/auth.service.js';
import { disconnectKitchen } from '../socket/emit.js';
import { AppError } from '../utils/AppError.js';

export async function register(req, res) {
  const session = await registerOwner(req.valid.body);
  res.status(201).json(session);
}

export async function login(req, res) {
  const session = await loginOwner(req.valid.body);
  res.json(session);
}

export async function me(req, res) {
  const restaurant = await Restaurant.findById(req.auth.restaurantId);
  if (!restaurant) {
    throw new AppError(401, 'UNAUTHORIZED', 'Your session has ended. Please log in again.');
  }
  res.json({ staff: req.staff.toPublic(), restaurant: restaurant.toPublic() });
}

// POST /api/auth/logout-all — for a lost phone or a login left on someone else's device. Raising
// tokenVersion makes every token issued so far fail on its next request, and the café's kitchen
// screens are disconnected so their live connection has to log in again too.
export async function logoutEverywhere(req, res) {
  await Staff.updateOne({ _id: req.staff._id }, { $inc: { tokenVersion: 1 } });
  disconnectKitchen(req.auth.restaurantId);
  res.status(204).end();
}
