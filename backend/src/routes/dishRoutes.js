import { Router } from 'express';
import { listDishes, updateDish } from '../controllers/dishController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(listDishes));
router.patch('/:dishId', asyncHandler(updateDish));

export default router;
