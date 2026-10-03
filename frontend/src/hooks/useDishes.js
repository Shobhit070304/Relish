import { useCallback, useEffect, useRef, useState } from 'react';
import { getDishes } from '../services/dishes.js';

const WS_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/^http/, 'ws');

export function useDishes() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [incomingUpdate, setIncomingUpdate] = useState(null);
  const reconnectTimeoutRef = useRef(null);

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

  // WebSocket connection with automatic reconnect
  useEffect(() => {
    let socket = null;
    let isMounted = true;

    function connect() {
      try {
        socket = new WebSocket(WS_URL);

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'DISH_UPDATED' && data.dish) {
              setIncomingUpdate(data.dish);
            }
          } catch {
            // Ignore malformed messages
          }
        };

        socket.onclose = () => {
          if (isMounted) {
            reconnectTimeoutRef.current = setTimeout(connect, 3000);
          }
        };

        socket.onerror = () => {
          socket.close();
        };
      } catch {
        if (isMounted) {
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        }
      }
    }

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket) {
        socket.close();
      }
    };
  }, []);

  function replaceDish(savedDish) {
    setDishes((current) => current.map((dish) => (dish.dishId === savedDish.dishId ? savedDish : dish)));
  }

  return { dishes, loading, error, reload, replaceDish, incomingUpdate };
}
