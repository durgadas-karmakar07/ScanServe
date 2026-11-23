import { Restaurant } from '../models/Restaurant.js';
import { loginOwner, registerOwner } from '../services/auth.service.js';
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
