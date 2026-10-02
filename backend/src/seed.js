import 'dotenv/config';
import mongoose from 'mongoose';
import { readFile } from 'node:fs/promises';
import { connectToDatabase } from './config/database.js';
import { insertSeedDishes } from './repositories/dishRepository.js';

const filePath = new URL('../data/dishes.json', import.meta.url);

try {
  const input = JSON.parse(await readFile(filePath, 'utf8'));
  const dishes = Array.isArray(input) ? input : input.dishes;
  if (!Array.isArray(dishes) || dishes.length === 0) {
    throw new Error('Expected a non-empty array of dishes (or an object with a dishes array).');
  }

  const seenIds = new Set();
  for (const dish of dishes) {
    if (typeof dish.dishId !== 'string' || !dish.dishId.trim() || seenIds.has(dish.dishId)) {
      throw new Error('Every dish needs a unique, non-empty string dishId.');
    }
    if (typeof dish.dishName !== 'string' || typeof dish.imageUrl !== 'string' || typeof dish.isPublished !== 'boolean') {
      throw new Error(`Dish ${dish.dishId} must have dishName, imageUrl and isPublished with the expected types.`);
    }
    seenIds.add(dish.dishId);
  }

  await connectToDatabase();
  await insertSeedDishes(dishes);
  console.log(`Seed complete. Checked ${dishes.length} dishes; existing records were left unchanged.`);
} catch (error) {
  console.error(`Seed failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
