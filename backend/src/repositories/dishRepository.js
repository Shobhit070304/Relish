import { Dish } from '../models/Dish.js';

export function findAllDishes() {
  return Dish.find().sort({ dishId: 1 }).lean();
}

export function findDishById(dishId) {
  return Dish.findOne({ dishId }).lean();
}

export function updateDishAtVersion(dishId, expectedVersion, changes) {
  return Dish.findOneAndUpdate(
    { dishId, version: expectedVersion },
    { $set: changes, $inc: { version: 1 } },
    { new: true, runValidators: true }
  ).lean();
}

export function insertSeedDishes(dishes) {
  return Dish.bulkWrite(dishes.map((dish) => ({
    updateOne: {
      filter: { dishId: dish.dishId },
      update: { $setOnInsert: { ...dish, version: 1 } },
      upsert: true
    }
  })));
}
