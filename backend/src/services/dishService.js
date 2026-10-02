import { AppError } from '../utils/appError.js';
import { isHttpUrl, validateDishUpdate } from '../utils/dishValidation.js';
import { findAllDishes, findDishById, updateDishAtVersion } from '../repositories/dishRepository.js';

export function getDishes() {
  return findAllDishes();
}

export async function saveDish(dishId, body) {
  const { dishName, isPublished, expectedVersion } = validateDishUpdate(dishId, body);
  const currentDish = await findDishById(dishId);
  if (!currentDish) throw new AppError('Dish not found.', 404);

  if (currentDish.version !== expectedVersion) {
    throw new AppError('This dish changed since it was loaded.', 409, { currentDish });
  }
  if (isPublished && !dishName.trim()) {
    throw new AppError('A published dish must have a name.', 400);
  }
  if (isPublished && !isHttpUrl(currentDish.imageUrl)) {
    throw new AppError('A published dish must have a valid HTTP or HTTPS image URL.', 400);
  }

  const savedDish = await updateDishAtVersion(dishId, expectedVersion, { dishName, isPublished });
  if (savedDish) return savedDish;

  const latestDish = await findDishById(dishId);
  if (!latestDish) throw new AppError('Dish not found.', 404);
  throw new AppError('This dish changed since it was loaded.', 409, { currentDish: latestDish });
}
