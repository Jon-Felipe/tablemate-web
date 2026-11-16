import { Link } from 'react-router';

// extras
import { useAuth } from '../features/auth/useAuth';
import styles from './Header.module.css';

function Header() {
  const { isAuthenticated } = useAuth();

  return (
    <header className={styles.siteHeader}>
      <Link to='/' className={styles.brand}>
        TableMate
      </Link>

      <nav className={styles.mainNav} aria-label='Main navigation'>
        <Link to='/discover'>Discover</Link>
        <Link to='/restaurants'>Restaurants</Link>
        <Link to='/occasions'>Occasions</Link>
        <Link to='/about'>About</Link>
      </nav>

      <div className={styles.headerActions}>
        {isAuthenticated ? (
          <Link to='/profile' className={styles.loginButton}>
            Profile
          </Link>
        ) : (
          <>
            <Link to='/login' className={styles.loginButton}>
              Log in
            </Link>

            <Link to='/register' className={styles.signupButton}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
