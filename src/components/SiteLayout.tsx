import { Outlet } from 'react-router';

// components
import Header from './Header';

function SiteLayout() {
  return (
    <div className='app'>
      <Header />

      <main>
        <Outlet />
      </main>

      <footer className='site-footer'>
        <p>TableMate © 2026</p>
        <p>Find your next favourite table.</p>
      </footer>
    </div>
  );
}

export default SiteLayout;
