import { Link } from 'react-router';
import {
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
} from 'react-icons/fa';

// extras
import styles from './Footer.module.css';

function Footer() {
  return (
    <footer className={styles.siteFooter}>
      <div className={styles.footerMain}>
        <div className={styles.footerBrand}>
          <Link to='/' className={styles.footerLogo}>
            <span>TableMate</span>
          </Link>

          <p>
            An elevated culinary exploration and reservation network tailored
            for boutique dining, tasting rooms, and neighborhood favorites.
          </p>
        </div>

        <div className={styles.footerColumn}>
          <h3>TableMate</h3>
          <Link to='/restaurants'>Contemporary Tasting</Link>
          <Link to='/restaurants?cuisine=Italian'>Woodfired Trattoria</Link>
          <Link to='/restaurants?cuisine=Japanese'>Omakase & Kaiseki</Link>
          <Link to='/restaurants'>Natural Wine Bistros</Link>
        </div>

        <div className={styles.footerColumn}>
          <h3>For Restaurants</h3>
          <Link to='/partner'>Partner with TableMate</Link>
          <Link to='/host-login'>Host Management System</Link>
          <Link to='/sommelier'>Sommelier Curation</Link>
          <Link to='/staff-login'>Staff Portal Login</Link>
        </div>

        <div className={styles.footerColumn}>
          <h3>Legal & Support</h3>
          <Link to='/privacy'>Privacy Policy</Link>
          <Link to='/terms'>Terms of Hospitality</Link>
          <Link to='/concierge'>Concierge Desk</Link>
          <Link to='/press'>Press Inquiries</Link>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>© 2024 TableMate Hospitality Inc. Crafted for discerning diners.</p>

        <div className={styles.footerSocials}>
          <a
            href='https://www.instagram.com/'
            target='_blank'
            rel='noreferrer'
            aria-label='Instagram'
          >
            <FaInstagram aria-hidden='true' />
          </a>
          <a
            href='https://www.facebook.com/'
            target='_blank'
            rel='noreferrer'
            aria-label='Facebook'
          >
            <FaFacebookF aria-hidden='true' />
          </a>
          <a
            href='https://www.linkedin.com/'
            target='_blank'
            rel='noreferrer'
            aria-label='LinkedIn'
          >
            <FaLinkedinIn aria-hidden='true' />
          </a>
          <a href='mailto:hello@tablemate.com' aria-label='Email us'>
            <FaEnvelope aria-hidden='true' />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
