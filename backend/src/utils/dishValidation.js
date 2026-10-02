import { AppError } from './appError.js';

export function validateDishUpdate(dishId, body) {
  if (typeof dishId !== 'string' || !dishId.trim()) {
    throw new AppError('dishId is required.', 400);
  }

  const { dishName, isPublished, expectedVersion } = body ?? {};
  if (typeof dishName !== 'string') throw new AppError('dishName must be a string.', 400);
  if (typeof isPublished !== 'boolean') throw new AppError('isPublished must be a boolean.', 400);
  if (!Number.isInteger(expectedVersion) || expectedVersion < 1) {
    throw new AppError('expectedVersion must be a positive integer.', 400);
  }

  return { dishName, isPublished, expectedVersion };
}

export function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
