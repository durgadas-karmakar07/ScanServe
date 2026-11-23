import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const TOKEN_LIFETIME = '7d';
const ALGORITHM = 'HS256';

// The token carries only what requireAuth needs (Rules.md section 5): no name, email or secrets.
export function signToken(staff) {
  const payload = {
    staffId: staff.id,
    restaurantId: String(staff.restaurantId),
    role: staff.role,
    tokenVersion: staff.tokenVersion,
  };
  return jwt.sign(payload, env.JWT_SECRET, { algorithm: ALGORITHM, expiresIn: TOKEN_LIFETIME });
}

// Pinning the algorithm stops tokens signed with a different algorithm (or "none") from passing.
export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET, { algorithms: [ALGORITHM] });
}
