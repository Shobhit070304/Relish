import { env } from './config/env.js';
import { connectToDatabase } from './config/database.js';
import app from './app.js';

async function startServer() {
  await connectToDatabase();
  app.listen(env.port, () => {
    console.log(`Nosh API listening on http://localhost:${env.port}`);
  });
}

startServer().catch((error) => {
  console.error('Could not start the API:', error.message);
  process.exit(1);
});
