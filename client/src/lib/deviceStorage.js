// This phone's device ID and the customer's first name, kept in localStorage so they are
// remembered on the next visit. Storage can throw (private mode, blocked site data), so every
// call is guarded; without storage the phone simply gets a new ID next time.
const DEVICE_KEY = 'scanserve.deviceId';
const NAME_KEY = 'scanserve.customerName';

function read(key) {
  try {
    return localStorage.getItem(key) || null;
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Not saved: it works for this visit only.
  }
}

export const readDeviceId = () => read(DEVICE_KEY);
export const saveDeviceId = (deviceId) => write(DEVICE_KEY, deviceId);
export const readCustomerName = () => read(NAME_KEY);
export const saveCustomerName = (name) => write(NAME_KEY, name);
