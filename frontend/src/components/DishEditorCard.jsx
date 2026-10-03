import { useEffect, useState } from 'react';
import { updateDish } from '../services/dishes.js';

export default function DishEditorCard({ dish, externalUpdate, onSaved, onReload }) {
  const [name, setName] = useState(dish.dishName);
  const [published, setPublished] = useState(dish.isPublished);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(false);
  const [newerDataAvailable, setNewerDataAvailable] = useState(null);

  const dirty = name !== dish.dishName || published !== dish.isPublished;

  // Sync state if dish prop changes and user is not editing
  useEffect(() => {
    if (!dirty) {
      setName(dish.dishName);
      setPublished(dish.isPublished);
    }
  }, [dish.dishName, dish.isPublished, dirty]);

  // Handle external WebSocket updates
  useEffect(() => {
    if (!externalUpdate || externalUpdate.dishId !== dish.dishId) return;
    if (externalUpdate.version <= dish.version) return;

    if (dirty) {
      // PRESERVE DRAFT: do not overwrite local draft, show notification banner
      setNewerDataAvailable(externalUpdate);
    } else {
      // NO UNSAVED CHANGES: safely update to latest server state
      onSaved(externalUpdate);
      setName(externalUpdate.dishName);
      setPublished(externalUpdate.isPublished);
      setNewerDataAvailable(null);
    }
  }, [externalUpdate, dirty, dish.dishId, dish.version, onSaved]);

  function acceptExternalUpdate() {
    if (newerDataAvailable) {
      onSaved(newerDataAvailable);
      setName(newerDataAvailable.dishName);
      setPublished(newerDataAvailable.isPublished);
      setNewerDataAvailable(null);
      setError('');
      setConflict(false);
    }
  }

  async function save() {
    setSaving(true);
    setError('');
    setConflict(false);
    try {
      const saved = await updateDish(dish, { dishName: name, isPublished: published });
      onSaved(saved);
      setName(saved.dishName);
      setPublished(saved.isPublished);
      setNewerDataAvailable(null);
    } catch (saveError) {
      setError(saveError.message || 'Could not reach the server. Your draft is still here.');
      setConflict(saveError.status === 409);
    } finally {
      setSaving(false);
    }
  }

  function reloadLatest() {
    if (window.confirm('Reload the latest saved dishes? This will discard your local draft.')) onReload();
  }

  return (
    <article className="editor-card">
      <DishPreviewCardForEditor dish={dish} published={published} />
      <div className="editor-body">
        {newerDataAvailable && (
          <div className="form-message conflict-message" style={{ marginBottom: '10px' }} role="status">
            <span>✳ Newer saved data is available (v{newerDataAvailable.version})</span>
            <button type="button" onClick={acceptExternalUpdate}>Load latest</button>
          </div>
        )}
        <div className="editor-id"><span>DISH ID</span><code>{dish.dishId}</code><span className="version-label">VERSION {dish.version}</span></div>
        <label className="field-label" htmlFor={`dish-name-${dish.dishId}`}>Dish name</label>
        <input className="text-input" id={`dish-name-${dish.dishId}`} value={name} onChange={(event) => setName(event.target.value)} />
        <label className="publish-control">
          <span><strong>Published</strong><small>Available on your menu</small></span>
          <input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} />
          <span className="switch" aria-hidden="true"><span /></span>
        </label>
        <div className="editor-bottom">
          <span className={dirty ? 'draft-indicator' : 'saved-indicator'}>{dirty ? '● Unsaved changes' : '✓ Saved'}</span>
          <div className="editor-actions">
            <button className="button button-quiet" disabled={!dirty || saving} onClick={() => { setName(dish.dishName); setPublished(dish.isPublished); setError(''); setConflict(false); }}>Discard</button>
            <button className="button button-primary" disabled={!dirty || saving} onClick={save}>{saving ? 'Saving…' : 'Save changes'}</button>
          </div>
        </div>
        {error && <div className={`form-message ${conflict ? 'conflict-message' : ''}`} role="alert"><span>{error}</span>{conflict && <button onClick={reloadLatest}>Reload latest</button>}</div>}
      </div>
    </article>
  );
}

function DishPreviewCardForEditor({ dish, published }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="editor-image">
      {!imageFailed && <img src={dish.imageUrl} alt={dish.dishName} onError={() => setImageFailed(true)} />}
      {imageFailed && <span className="image-placeholder">Image unavailable</span>}
      <span className={`preview-status ${published ? 'is-published' : ''}`}>{published ? 'Published' : 'Unpublished'}</span>
    </div>
  );
}
