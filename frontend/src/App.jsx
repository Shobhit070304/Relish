import { useEffect, useState } from 'react';
import HomePage from './pages/HomePage.jsx';
import DishListingPage from './pages/DishListingPage.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import SiteHeader from './components/SiteHeader.jsx';

function getSavedTheme() {
  try {
    return localStorage.getItem('nosh-theme') === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export default function App() {
  const [theme, setTheme] = useState(getSavedTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('nosh-theme', theme);
    } catch {
      // The app still works when browser storage is unavailable.
    }
  }, [theme]);

  const isDishesPage = window.location.pathname.replace(/\/$/, '') === '/dishes';

  return (
    <div className="app-shell">
      <SiteHeader theme={theme} onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
      <main>{isDishesPage ? <DishListingPage /> : <HomePage />}</main>
      <SiteFooter />
    </div>
  );
}
