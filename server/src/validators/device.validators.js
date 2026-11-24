import { z } from 'zod';

// Device IDs are random UUID v4 values made by the server (Rules.md section 5).
export const deviceIdSchema = z.uuidv4();

// POST /api/devices: with a known deviceId it confirms that device; without one (or with an
// unknown one) the server makes a new device. A phone can never choose its own ID.
export const registerDeviceSchema = z
  .object({
    deviceId: deviceIdSchema.optional(),
  })
  .strict();
