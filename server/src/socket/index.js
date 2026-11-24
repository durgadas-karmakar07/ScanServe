import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { authenticateOwner } from '../middleware/requireAuth.js';
import { Device } from '../models/Device.js';
import { AppError } from '../utils/AppError.js';
import { deviceIdSchema } from '../validators/device.validators.js';
import { deviceRoom, kitchenRoom, setSocketServer } from './emit.js';

// Live updates (Rules.md section 5, Socket.io):
// - The server picks the room: a kitchen joins only its own café's room (from the verified login
//   token), a phone joins only its own device room. Clients cannot choose a room.
// - A connection without a valid token or a known device ID is refused.
// - Clients never change data over sockets: there are no client events at all. Every change
//   goes through the REST API, so validation, auth and rate limits always apply.
export function attachSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.CLIENT_ORIGIN },
    serveClient: false,
    // Clients send only the small handshake, never data.
    maxHttpBufferSize: 10_000,
  });

  io.use(async (socket, next) => {
    try {
      const { token, deviceId } = socket.handshake.auth ?? {};
      if (typeof token === 'string' && token) {
        const { restaurantId } = await authenticateOwner(token);
        socket.data.room = kitchenRoom(restaurantId);
      } else {
        const parsed = deviceIdSchema.safeParse(deviceId);
        if (!parsed.success || !(await Device.exists({ deviceId: parsed.data }))) {
          throw new AppError(401, 'UNAUTHORIZED', 'Unknown device');
        }
        socket.data.room = deviceRoom(parsed.data);
      }
      next();
    } catch (err) {
      // A real "no" (bad or revoked token, unknown device) is final: UNAUTHORIZED. Anything else,
      // such as the database being briefly unreachable, tells the client to try again: RETRY.
      next(new Error(err instanceof AppError ? 'UNAUTHORIZED' : 'RETRY'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(socket.data.room);
  });

  setSocketServer(io);
  return io;
}
