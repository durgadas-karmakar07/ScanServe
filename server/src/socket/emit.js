// Sends live news to screens. Rooms are decided by the server (socket/index.js): one per café's
// kitchen and one per customer phone. Before the socket server starts (or in scripts that only
// import the app) these do nothing.
let io = null;

export const kitchenRoom = (restaurantId) => `kitchen:${restaurantId}`;
export const deviceRoom = (deviceId) => `device:${deviceId}`;

export function setSocketServer(server) {
  io = server;
}

export function emitToKitchen(restaurantId, event, payload) {
  io?.to(kitchenRoom(String(restaurantId))).emit(event, payload);
}

export function emitToDevice(deviceId, event, payload) {
  io?.to(deviceRoom(deviceId)).emit(event, payload);
}

// After "Log out everywhere": every kitchen screen of the café must connect again, and the
// handshake then refuses the old, revoked logins.
export function disconnectKitchen(restaurantId) {
  io?.in(kitchenRoom(String(restaurantId))).disconnectSockets(true);
}
