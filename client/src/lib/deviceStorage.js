// This phone's device ID and the customer's first name, kept in localStorage so they are
// remembered on the next visit. Storage can throw (private mode, blocked site data), so every
// call is guarded, and a copy is kept in memory: without storage the ID still works for this
// visit (placing an order, then opening its status page), and the phone gets a new ID next time.
const DEVICE_KEY = 'scanserve.deviceId';
const NAME_KEY = 'scanserve.customerName';
const memory = new Map();

function read(key) {
  try {
    const value = localStorage.getItem(key);
    if (value) return value;
  } catch {
    // Storage is blocked: use the copy in memory.
  }
  return memory.get(key) ?? null;
}

function write(key, value) {
  memory.set(key, value);
  try {
    localStorage.setItem(key, value);
  } catch {
    // Not saved: the copy in memory lasts for this visit.
  }
}

export const readDeviceId = () => read(DEVICE_KEY);
export const saveDeviceId = (deviceId) => write(DEVICE_KEY, deviceId);
export const readCustomerName = () => read(NAME_KEY);
export const saveCustomerName = (name) => write(NAME_KEY, name);
