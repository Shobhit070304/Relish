import { getDishes, saveDish } from '../services/dishService.js';

export async function listDishes(_req, res) {
  res.json(await getDishes());
}

export async function updateDish(req, res) {
  res.json(await saveDish(req.params.dishId, req.body));
}
