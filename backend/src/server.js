import { env } from './config/env.js';
import { connectToDatabase } from './config/database.js';
import app from './app.js';
import http from 'node:http';
import { initWebSocketServer } from './config/websocket.js';

async function startServer() {
  await connectToDatabase();
  const server = http.createServer(app);
  initWebSocketServer(server);

  server.listen(env.port, () => {
    console.log(`Relish API listening on http://localhost:${env.port}`);
  });
}

startServer().catch((error) => {
  console.error('Could not start the API:', error.message);
  process.exit(1);
});
