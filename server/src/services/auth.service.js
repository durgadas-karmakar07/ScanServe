import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { Restaurant } from '../models/Restaurant.js';
import { Staff } from '../models/Staff.js';
import { AppError } from '../utils/AppError.js';
import { signToken } from '../utils/token.js';

const BCRYPT_COST = 12;

// Checked when the email has no account, so a wrong email takes as long as a wrong password and
// response times do not reveal which emails are registered.
const DUMMY_HASH = await bcrypt.hash('scanserve-timing-guard', BCRYPT_COST);

// Same message for every credential problem (Rules.md section 5).
const invalidCredentials = (statusCode) =>
  new AppError(statusCode, 'INVALID_CREDENTIALS', 'Invalid email or password');

const toSession = (staff, restaurant) => ({
  token: signToken(staff),
  staff: staff.toPublic(),
  restaurant: restaurant.toPublic(),
});

export async function registerOwner({ restaurantName, slug, upiId, ownerName, email, password }) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  let restaurant;
  let staff;

  try {
    // The café and its owner are saved together or not at all, so a failed sign-up leaves no
    // café without an owner.
    await mongoose.connection.transaction(async (session) => {
      [restaurant] = await Restaurant.create([{ name: restaurantName, slug, upiId }], { session });
      [staff] = await Staff.create(
        [{ restaurantId: restaurant._id, name: ownerName, email, passwordHash }],
        { session },
      );
    });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.slug) {
      throw new AppError(409, 'SLUG_TAKEN', 'This café link is already taken.', {
        slug: 'This link is already taken. Please choose another.',
      });
    }
    // Answer like a wrong password so sign-up cannot be used to test which emails have accounts.
    if (err.code === 11000 && err.keyPattern?.email) throw invalidCredentials(400);
    throw err;
  }

  return toSession(staff, restaurant);
}

export async function loginOwner({ email, password }) {
  const staff = await Staff.findOne({ email }).select('+passwordHash');
  const isMatch = await bcrypt.compare(password, staff?.passwordHash ?? DUMMY_HASH);
  if (!staff || !isMatch) throw invalidCredentials(401);

  const restaurant = await Restaurant.findById(staff.restaurantId);
  if (!restaurant) throw invalidCredentials(401);

  return toSession(staff, restaurant);
}
