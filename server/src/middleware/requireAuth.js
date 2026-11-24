import { z } from 'zod';
import { Staff } from '../models/Staff.js';
import { AppError } from '../utils/AppError.js';
import { verifyToken } from '../utils/token.js';
import { objectId } from '../validators/common.js';

const BEARER_PREFIX = 'Bearer ';

const payloadSchema = z.object({
  staffId: objectId,
  restaurantId: objectId,
  role: z.literal('owner'),
  tokenVersion: z.number().int().min(0),
});

const unauthorized = (message) => new AppError(401, 'UNAUTHORIZED', message);

// Checks an owner's login token: valid signature, expected contents, and not revoked (a changed
// tokenVersion means it was). Used by requireAuth and by the kitchen's live connection.
export async function authenticateOwner(token) {
  let payload;
  try {
    payload = payloadSchema.parse(verifyToken(token));
  } catch {
    throw unauthorized('Your session has ended. Please log in again.');
  }

  const staff = await Staff.findOne({ _id: payload.staffId, restaurantId: payload.restaurantId });
  if (!staff || staff.tokenVersion !== payload.tokenVersion) {
    throw unauthorized('Your session has ended. Please log in again.');
  }
  return { staff, restaurantId: payload.restaurantId };
}

// Every owner route uses this. Later handlers must take restaurantId from req.auth only, never
// from the request body, params or query (Rules.md section 5).
export async function requireAuth(req, res, next) {
  const header = req.get('authorization') ?? '';
  if (!header.startsWith(BEARER_PREFIX)) throw unauthorized('Please log in.');

  const { staff, restaurantId } = await authenticateOwner(
    header.slice(BEARER_PREFIX.length).trim(),
  );
  req.auth = { staffId: staff.id, restaurantId, role: staff.role };
  req.staff = staff;
  next();
}
