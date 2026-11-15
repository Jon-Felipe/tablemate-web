import React from 'react';
import { Link, useNavigate } from 'react-router';

// extras
import styles from './LoginPage.module.css';
import { useAuth } from '../../features/auth/useAuth';

function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    if (password.length < 12) {
      alert('Password must be at least 12 characters long.');
      return;
    }

    try {
      await login({ email, password });
      navigate('/');
    } catch (error: any) {
      alert(error?.data?.message || 'An error occurred during login.');
    }
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <section className={styles.loginCard}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>⚑</div>
            <span className={styles.reserveTag}>RESERVE</span>
          </div>

          <h1>Return to Your Table</h1>

          <p className={styles.subtitle}>
            Access your taste passport, reserved tasting allocations, and
            concierge sommelier notes.
          </p>

          <div className={styles.socialLogin}>
            <button type='button' className={styles.socialBtn}>
              <span className={styles.googleIcon}>G</span>
              Google Access
            </button>

            <button type='button' className={styles.socialBtn}>
              <span className={styles.appleIcon}>●</span>
              Apple ID
            </button>
          </div>

          <div className={styles.divider}>
            <span></span>
            <p>OR CONTINUE WITH EMAIL</p>
            <span></span>
          </div>

          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <span className={styles.inputIcon}>✉</span>
              <input
                type='email'
                name='email'
                placeholder='Connoisseur email address'
              />
            </div>

            <div className={styles.inputGroup}>
              <span className={styles.inputIcon}>🔒</span>
              <input type='password' name='password' placeholder='Password' />
            </div>

            <div className={styles.formOptions}>
              <label className={styles.remember}>
                <input type='checkbox' defaultChecked />
                <span>Remember for 30 days</span>
              </label>

              <a href='#' className={styles.forgotPassword}>
                Forgot password?
              </a>
            </div>

            <button
              type='submit'
              className={styles.signinBtn}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? 'Signing In...' : 'Sign In to TableMate'}
              <span>→</span>
            </button>
          </form>

          <div className={styles.signup}>
            Don't have a TableMate account yet?
            <Link to='/register'>Create an account ↗</Link>
          </div>
        </section>

        <footer className={styles.loginFooter}>
          <div className={styles.membershipRow}>
            <span>✦</span>
            MEMBER OF THE GLOBAL DINING ALLIANCE
            <span className={styles.bullet}>•</span>
          </div>

          <div className={styles.membershipDetails}>
            <span>♜ &nbsp;2,400+ MICHELIN & CURATED TABLES</span>
            <span className={styles.bullet}>•</span>
            <span>♧ &nbsp;DIRECT MAÎTRE D' SYNC</span>
          </div>
        </footer>

        <p className={styles.testimonial}>
          “An exquisite passport for those who treat dining as an art form.”
          <span> — The Epikur Hospitality Review</span>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
