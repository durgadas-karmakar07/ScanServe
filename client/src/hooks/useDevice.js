import { useCallback, useState } from 'react';
import { registerDevice } from '../api/devices.js';
import {
  readCustomerName,
  readDeviceId,
  saveCustomerName,
  saveDeviceId,
} from '../lib/deviceStorage.js';

// The customer's phone: its device ID (made by the server the first time this phone orders,
// then kept in localStorage) and the first name to call out. Nothing is sent just for viewing
// the menu, which keeps cheap phones and the free server light.
export function useDevice() {
  const [name, setName] = useState(readCustomerName);

  const saveName = useCallback((value) => {
    saveCustomerName(value);
    setName(value);
  }, []);

  // Returns this phone's device ID, asking the server for one if there is none yet.
  // isFresh: the saved ID was not recognised (for example the server's data was reset), so get
  // a new one.
  const ensureDeviceId = useCallback(async ({ isFresh = false } = {}) => {
    const saved = isFresh ? null : readDeviceId();
    if (saved) return saved;
    const { device } = await registerDevice();
    saveDeviceId(device.deviceId);
    return device.deviceId;
  }, []);

  return { name, saveName, ensureDeviceId };
}
