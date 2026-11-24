import crypto from 'node:crypto';
import { Device } from '../models/Device.js';

// Confirms a phone's device ID, or gives it a new one. The ID is always made here, never by the
// phone, so it is random and cannot be chosen to match someone else's.
export async function registerDevice(req, res) {
  const { deviceId } = req.valid.body;
  if (deviceId) {
    const device = await Device.findOneAndUpdate(
      { deviceId },
      { $set: { lastSeenAt: new Date() } },
      { returnDocument: 'after' },
    );
    if (device) return res.json({ device: device.toCustomer() });
  }

  const device = await Device.create({ deviceId: crypto.randomUUID() });
  res.status(201).json({ device: device.toCustomer() });
}
