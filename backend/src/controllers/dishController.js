import { getDishes, saveDish } from '../services/dishService.js';

export async function listDishes(_req, res) {
  const dishes = await getDishes();
  return res.status(200).json(dishes);
}

export async function updateDish(req, res) {
  const updatedDish = await saveDish(req.params.dishId, req.body);
  return res.status(200).json(updatedDish);
}
