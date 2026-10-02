import { useState } from 'react';

export default function DishPreviewCard({ dish }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="preview-card">
      <div className="preview-image">
        {!imageFailed && <img src={dish.imageUrl} alt={dish.dishName} onError={() => setImageFailed(true)} />}
        {imageFailed && <span className="image-placeholder">Image unavailable</span>}
        <span className={`preview-status ${dish.isPublished ? 'is-published' : ''}`}>{dish.isPublished ? 'On the menu' : 'In draft'}</span>
      </div>
      <div className="preview-info"><h3>{dish.dishName}</h3><span>Dish {dish.dishId}</span></div>
    </article>
  );
}
