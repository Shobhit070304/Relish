import DishPreviewCard from '../components/DishPreviewCard.jsx';
import { useDishes } from '../hooks/useDishes.js';

const benefits = [
  { number: '01', title: 'Start with a draft', text: 'Shape a dish name or menu status privately. Your saved menu stays as it is until you save.' },
  { number: '02', title: 'Save with confidence', text: 'Every change checks the version you started from, so a newer edit is never silently replaced.' },
  { number: '03', title: 'Keep your menu yours', text: 'Your saved dishes live in MongoDB and are still there when the app restarts.' }
];

export default function HomePage() {
  const { dishes, loading, error } = useDishes();
  const featuredDish = dishes.find((dish) => dish.isPublished) || dishes[0];

  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-mark">✳</span> THE MENU, MADE MANAGEABLE</div>
            <h1>A little more <em>care</em> for your menu.</h1>
            <p className="hero-description">Meet a calmer home for the dishes you love to serve. Make a change, keep it in draft, and save when it feels right.</p>
            <div className="hero-actions"><a className="button button-primary button-large" href="/dishes">Explore your dishes <span aria-hidden="true">↗</span></a><a className="text-link" href="#how-it-works">See how it works <span aria-hidden="true">↓</span></a></div>
            <div className="hero-note"><span className="avatar-stack"><i>n</i><i>✳</i><i>♡</i></span><span>Thoughtful tools for the people behind the plate.</span></div>
          </div>
          <div className="hero-art" aria-label={featuredDish ? `Featured dish: ${featuredDish.dishName}` : 'Dish image preview'}>
            <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
            <div className="hero-image-frame">
              {featuredDish && <img src={featuredDish.imageUrl} alt={featuredDish.dishName} onError={(event) => { event.currentTarget.hidden = true; }} />}
              <span className="hero-image-fallback">Made with care<br /><small>served with a little Nosh</small></span>
              <div className="hero-image-shade" />
              <div className="hero-image-caption"><span>ON THE MENU</span><strong>{featuredDish?.dishName || 'A good thing, cooking'}</strong></div>
            </div>
            <div className="floating-note note-top"><span className="note-check">✓</span><span><strong>Saved safely</strong><small>Your menu is up to date</small></span></div>
            <div className="floating-note note-bottom"><span className="note-spark">✳</span><span><strong>Made for real kitchens</strong><small>Simple by design</small></span></div>
            <span className="art-doodle">✳</span>
          </div>
        </div>
      </section>

      <section className="promise-strip" aria-label="Product principles">
        <div className="container promise-inner"><span>GOOD MENUS TAKE CARE</span><i /> <span>DRAFT BEFORE YOU SAVE</span><i /> <span>YOUR CHANGES STAY YOURS</span></div>
      </section>

      <section className="benefits-section section-pad" id="why-nosh">
        <div className="container">
          <div className="section-intro"><div className="eyebrow">A BETTER WAY TO KEEP UP</div><h2>Small details.<br /><em>More peace of mind.</em></h2><p>Menu updates should feel easy and safe. Nosh keeps the important parts clear, without adding more process to your day.</p></div>
          <div className="benefit-grid">{benefits.map((benefit) => <article className="benefit-card" key={benefit.number}><span className="benefit-number">{benefit.number}</span><div className="benefit-icon" aria-hidden="true">{benefit.number === '01' ? '✎' : benefit.number === '02' ? '↗' : '♡'}</div><h3>{benefit.title}</h3><p>{benefit.text}</p></article>)}</div>
        </div>
      </section>

      <section className="steps-section section-pad" id="how-it-works">
        <div className="container steps-layout"><div className="steps-heading"><div className="eyebrow">THREE EASY STEPS</div><h2>From thought<br />to <em>table.</em></h2><p>Your menu is always yours to shape. Nosh gives every edit a safe place to land.</p><a className="text-link" href="/dishes">Take a look around <span aria-hidden="true">↗</span></a></div><div className="steps-list"><article><span>01</span><div><h3>Make it yours</h3><p>Change a dish name or update its menu status.</p></div><span className="step-symbol">✎</span></article><article><span>02</span><div><h3>Keep it in draft</h3><p>Review your edits before anything is saved.</p></div><span className="step-symbol">◷</span></article><article><span>03</span><div><h3>Save when ready</h3><p>Your update is checked and safely stored.</p></div><span className="step-symbol">✓</span></article></div></div>
      </section>

      <section className="menu-section section-pad" id="menu">
        <div className="container">
          <div className="menu-heading"><div><div className="eyebrow">A FEW GOOD THINGS</div><h2>A peek at <em>your menu.</em></h2><p>Your dishes, ready to be cared for.</p></div><a className="button button-outline" href="/dishes">View all dishes <span aria-hidden="true">↗</span></a></div>
          {loading && <div className="menu-message">Loading dishes from your menu…</div>}
          {!loading && error && <div className="menu-message">Start the API and seed MongoDB to show your menu here.</div>}
          {!loading && !error && dishes.length === 0 && <div className="menu-message">Your dishes will appear here after you seed MongoDB.</div>}
          {!loading && !error && dishes.length > 0 && <div className="preview-grid">{dishes.slice(0, 3).map((dish) => <DishPreviewCard key={dish.dishId} dish={dish} />)}</div>}
        </div>
      </section>

      <section className="closing-section"><div className="container closing-card"><div className="closing-spark">✳</div><div className="eyebrow">READY WHEN YOU ARE</div><h2>Give your menu a little <em>room to grow.</em></h2><p>Take a look at your dishes. Your next good idea is welcome here.</p><a className="button button-light button-large" href="/dishes">Go to your dashboard <span aria-hidden="true">↗</span></a></div></section>
    </>
  );
}
