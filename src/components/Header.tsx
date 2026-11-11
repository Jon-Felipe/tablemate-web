import { Link } from 'react-router';

// extras
import { useAuth } from '../features/auth/useAuth';
import './Header.css';

function Header() {
  const { isAuthenticated } = useAuth();

  return (
    <header className='site-header'>
      <Link to='/' className='brand'>
        TableMate
      </Link>

      <nav className='main-nav' aria-label='Main navigation'>
        <Link to='/discover'>Discover</Link>
        <Link to='/restaurants'>Restaurants</Link>
        <Link to='/occasions'>Occasions</Link>
        <Link to='/about'>About</Link>
      </nav>

      <div className='header-actions'>
        {isAuthenticated ? (
          <Link to='/profile' className='login-button'>
            Profile
          </Link>
        ) : (
          <>
            <Link to='/login' className='login-button'>
              Log in
            </Link>

            <Link to='/register' className='signup-button'>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
