import mongoose from 'mongoose';

// A customer's phone. There is no customer login: the server gives each phone a random ID the
// first time it orders, and the phone keeps it in localStorage (Rules.md: store only a first
// name and the device ID).
const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  // The first name from the last order, e.g. "Riya" (or "Guest").
  name: { type: String, trim: true, maxlength: 30, default: '' },
  firstSeenAt: { type: Date, default: Date.now },
  lastSeenAt: { type: Date, default: Date.now },
  // Set for a few seconds while this phone's order is being placed, so a double tap cannot
  // create two orders or slip past the open-order limit. Never sent to the client.
  orderLockUntil: { type: Date, default: null },
});

deviceSchema.methods.toCustomer = function toCustomer() {
  return { deviceId: this.deviceId, name: this.name };
};

export const Device = mongoose.model('Device', deviceSchema);
