const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function readResponse(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.error || `Request failed (${response.status}).`);
    error.status = response.status;
    error.currentDish = body.currentDish;
    throw error;
  }
  return body;
}

export async function getDishes() {
  return readResponse(await fetch(`${API_URL}/dishes`));
}

export async function updateDish(dish, changes) {
  const response = await fetch(`${API_URL}/dishes/${encodeURIComponent(dish.dishId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...changes, expectedVersion: dish.version })
  });
  return readResponse(response);
}
