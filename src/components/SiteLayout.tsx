import { Link, Outlet } from 'react-router';

import { useAuth } from '../features/auth/useAuth';

function SiteLayout() {
  const { isAuthenticated } = useAuth();

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

        <div className='auth-nav'>
          {isAuthenticated ? (
            <Link to='/profile' className='login-link'>
              Profile
            </Link>
          ) : (
            <>
              <Link to='/login' className='login-link'>
                Log in
              </Link>

              <Link to='/register' className='register-button'>
                Create account
              </Link>
            </>
          )}
        </div>
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
