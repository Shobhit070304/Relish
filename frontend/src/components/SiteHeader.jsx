export default function SiteHeader({ theme, onToggleTheme }) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="wordmark" href="/" aria-label="Nosh home">
          <span className="wordmark-icon">n</span><span>nosh<span className="wordmark-period">.</span></span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="/#how-it-works">How it works</a>
          <a href="/#menu">Menu</a>
          <a href="/dishes">Dashboard</a>
        </nav>
        <div className="header-actions">
          <button className="theme-button" type="button" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`} title="Change theme">
            <span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
          </button>
          <a className="button button-dark header-cta" href="/dishes">Open dashboard <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </header>
  );
}
