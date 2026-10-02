import { AppError } from '../utils/appError.js';

export function notFoundHandler(_req, _res, next) {
  next(new AppError('Route not found.', 404));
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof SyntaxError && error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must be valid JSON.' });
  }

  const statusCode = error.statusCode || 500;
  if (statusCode === 500) console.error(error);

  return res.status(statusCode).json({
    error: statusCode === 500 ? 'An unexpected server error occurred.' : error.message,
    ...(error.details || {})
  });
}
