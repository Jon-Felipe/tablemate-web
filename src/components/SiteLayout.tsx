import { Link, Outlet } from 'react-router';

function SiteLayout() {
  return (
    <div className='app'>
      <header className='site-header'>
        <Link to='/' className='brand'>
          TableMate <span>.</span>
        </Link>

        <nav aria-label='Main navigation'>
          <Link to='/#restaurants'>Restaurants</Link>
          <Link to='/#about'>About</Link>
        </nav>
      </header>

      <Outlet />

      <footer className='site-footer'>
        <p>TableMate © 2026</p>
        <p>Find your next favourite table.</p>
      </footer>
    </div>
  );
}

export default SiteLayout;
