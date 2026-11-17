import { Link, NavLink } from 'react-router';
import { LuConciergeBell, LuCircleUserRound } from 'react-icons/lu';

// extras
import { useAuth } from '../features/auth/useAuth';
import styles from './Header.module.css';

const navLinks = [
  { to: '/discover', label: 'Discover' },
  { to: '/restaurants', label: 'Restaurants' },
  { to: '/saved', label: 'Saved' },
  { to: '/about', label: 'About' },
];

function Header() {
  const { isAuthenticated } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.navbar}>
        {/* Logo */}
        <Link to='/' className={styles.logo}>
          <span className={styles.logoIcon}>
            <LuConciergeBell size={18} strokeWidth={1.5} />
          </span>

          <span className={styles.logoText}>TableMate</span>
        </Link>

        {/* Navigation */}
        <nav className={styles.navLinks}>
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Actions */}
        <div className={styles.actions}>
          {/* Profile */}
          {isAuthenticated ? (
            <div className={styles.profile}>
              <button
                type='button'
                className={styles.profileButton}
                aria-label='Open profile menu'
              >
                <LuCircleUserRound size={24} strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <>
              <Link to='/login' className={styles.loginButton}>
                Log in
              </Link>

              <Link to='/register' className={styles.registerButton}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
