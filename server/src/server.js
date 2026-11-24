import http from 'node:http';
import { app } from './app.js';
import { env } from './config/env.js';
import { connectDb, disconnectDb } from './config/db.js';
import { attachSocketServer } from './socket/index.js';

// A plain http server (instead of app.listen) so Socket.io shares the same port.
const server = http.createServer(app);
const io = attachSocketServer(server);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${env.PORT} is already in use. Stop the other server or change PORT.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});

// Render sends SIGTERM on every deploy; Ctrl+C sends SIGINT. Close the DB connection cleanly.
function shutdown(signal) {
  console.info(`${signal} received, shutting down`);
  // io.close() ends the open live connections and then closes the http server too.
  io.close(async () => {
    await disconnectDb();
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

try {
  await connectDb();
} catch (err) {
  console.error(`Could not connect to MongoDB: ${err.message}`);
  process.exit(1);
}

server.listen(env.PORT, () => {
  console.info(`API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});
