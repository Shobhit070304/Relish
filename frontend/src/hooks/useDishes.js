import { useCallback, useEffect, useState } from 'react';
import { getDishes } from '../services/dishes.js';

export function useDishes() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setDishes(await getDishes());
    } catch (loadError) {
      setError(loadError.message || 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  function replaceDish(savedDish) {
    setDishes((current) => current.map((dish) => dish.dishId === savedDish.dishId ? savedDish : dish));
  }

  return { dishes, loading, error, reload, replaceDish };
}
