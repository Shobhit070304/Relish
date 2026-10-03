import { useMemo, useState } from 'react';
import DishEditorCard from '../components/DishEditorCard.jsx';
import { useDishes } from '../hooks/useDishes.js';

export default function DishListingPage() {
  const { dishes, loading, error, reload, replaceDish, incomingUpdate } = useDishes();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredDishes = useMemo(() => dishes.filter((dish) => {
    const matchesQuery = `${dish.dishName} ${dish.dishId}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'published' ? dish.isPublished : !dish.isPublished);
    return matchesQuery && matchesFilter;
  }), [dishes, filter, query]);

  return (
    <div className="container listing-page">
      <div className="listing-breadcrumb"><a href="/">Home</a><span>/</span><span>Dashboard</span></div>
      <div className="listing-heading"><div><div className="eyebrow">YOUR KITCHEN, IN ORDER</div><h1>The dishes.</h1><p>A thoughtful little space for everything on your menu.</p></div><button className="button button-outline refresh-button" onClick={reload} disabled={loading}><span aria-hidden="true">↻</span> Refresh menu</button></div>
      <div className="menu-summary"><div><strong>{dishes.length.toString().padStart(2, '0')}</strong><span>Total dishes</span></div><div><strong>{dishes.filter((dish) => dish.isPublished).length.toString().padStart(2, '0')}</strong><span>On the menu</span></div><div><strong>{dishes.filter((dish) => !dish.isPublished).length.toString().padStart(2, '0')}</strong><span>In draft</span></div><div className="summary-aside"><span className="summary-dot" /> Drafts stay private until you save.</div></div>
      <div className="listing-toolbar"><label className="search-box"><span aria-hidden="true">⌕</span><input type="search" placeholder="Find a dish…" value={query} onChange={(event) => setQuery(event.target.value)} /></label><div className="filter-tabs" aria-label="Filter dishes">{['all', 'published', 'draft'].map((value) => <button className={filter === value ? 'active' : ''} key={value} onClick={() => setFilter(value)}>{value === 'all' ? 'All dishes' : value === 'published' ? 'Published' : 'Drafts'}</button>)}</div></div>
      {loading && <div className="listing-state"><span className="spinner" />Loading your dishes…</div>}
      {!loading && error && <div className="listing-state listing-error"><strong>Couldn’t load your dishes.</strong><span>{error}</span><button className="button button-primary" onClick={reload}>Try again</button></div>}
      {!loading && !error && dishes.length === 0 && <div className="listing-state"><strong>No dishes yet</strong><span>Run the seed command to load your menu.</span></div>}
      {!loading && !error && dishes.length > 0 && filteredDishes.length === 0 && <div className="listing-state"><strong>No matches</strong><span>Try another dish name or filter.</span></div>}
      {!loading && !error && filteredDishes.length > 0 && (
        <div className="editor-grid">
          {filteredDishes.map((dish) => (
            <DishEditorCard
              key={dish.dishId}
              dish={dish}
              externalUpdate={incomingUpdate?.dishId === dish.dishId ? incomingUpdate : null}
              onSaved={replaceDish}
              onReload={reload}
            />
          ))}
        </div>
      )}
      <div className="listing-tip"><span aria-hidden="true">✳</span><p><strong>A small reminder</strong> You can edit freely. Nothing changes on your saved menu until you choose Save.</p></div>
    </div>
  );
}
