import { Device } from '../models/Device.js';
import { AppError } from '../utils/AppError.js';
import { deviceIdSchema } from '../validators/device.validators.js';

// Customer routes that act on orders use this. The phone sends its device ID in the
// X-Device-Id header; the device must exist. Later handlers use req.device only, so a phone can
// read its own orders and no one else's (Rules.md section 5).
export async function requireDevice(req, res, next) {
  const parsed = deviceIdSchema.safeParse(req.get('x-device-id'));
  if (!parsed.success) {
    throw new AppError(401, 'DEVICE_REQUIRED', 'Please reload the page and try again.');
  }

  const device = await Device.findOne({ deviceId: parsed.data });
  if (!device) {
    throw new AppError(401, 'DEVICE_UNKNOWN', 'Please reload the page and try again.');
  }

  req.device = device;
  next();
}
