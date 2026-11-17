import React from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import {
  FaApple,
  FaArrowRight,
  FaCheckCircle,
  FaEnvelope,
  FaLock,
  FaUtensils,
} from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

// extras
import styles from './LoginPage.module.css';
import { useAuth } from '../../features/auth/useAuth';

function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email')?.toString().trim();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (password.length < 12) {
      toast.error('Password must be at least 12 characters long.');
      return;
    }

    try {
      await login({ email, password });
      toast.success('Welcome back!');
      navigate('/');
    } catch (error: any) {
      toast.error(error?.data?.message || 'An error occurred during login.');
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.registerContainer}>
        {/* LEFT SIDE */}
        <section className={styles.formSection}>
          <div className={styles.formContent}>
            <header className={styles.brandHeader}>
              <div className={styles.brand}>
                <div className={styles.brandIcon}>
                  <FaUtensils />
                </div>

                <div>
                  <h2>TableMate</h2>
                  <span>DINING GAZETTE & BOOKINGS</span>
                </div>
              </div>
            </header>

            <div className={styles.heading}>
              <h1>Return to Your Table</h1>
              <p>
                Access your taste passport, reserved tasting allocations, and
                concierge sommelier notes.
              </p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label>Email Address</label>
                <div className={styles.inputWrapper}>
                  <FaEnvelope />
                  <input
                    type='email'
                    name='email'
                    placeholder='john@example.com'
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Password</label>
                <div className={styles.inputWrapper}>
                  <FaLock />
                  <input
                    type='password'
                    name='password'
                    placeholder='Password'
                    required
                  />
                </div>
              </div>

              <div className={styles.formOptions}>
                <label className={styles.remember}>
                  <input type='checkbox' defaultChecked />
                  <span>Remember for 30 days</span>
                </label>

                <Link to='/forgot-password' className={styles.forgotPassword}>
                  Forgot password?
                </Link>
              </div>

              <button
                type='submit'
                className={styles.submitButton}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? 'Signing In...' : 'Sign In to TableMate'}
                <FaArrowRight />
              </button>
            </form>

            <div className={styles.divider}>
              <span />
              <p>OR CONTINUE WITH</p>
              <span />
            </div>

            <div className={styles.socialButtons}>
              <button type='button'>
                <FcGoogle className={styles.googleIcon} />
                Google Access
              </button>

              <button type='button'>
                <FaApple className={styles.appleIcon} />
                Apple ID
              </button>
            </div>
          </div>

          <footer className={styles.formFooter}>
            <span>Don't have a TableMate account yet?</span>
            <Link to='/register'>
              Create an account <FaArrowRight />
            </Link>
          </footer>
        </section>

        {/* RIGHT SIDE */}
        <section className={styles.editorialSection}>
          <div className={styles.editorialOverlay} />

          <div className={styles.testimonialCard}>
            <div className={styles.stars}>★★★★★</div>

            <blockquote>
              “An exquisite passport for those who treat dining as an art form.”
            </blockquote>

            <div className={styles.testimonialDivider} />

            <div className={styles.testimonialAuthor}>
              <div>
                <h4>The Epikur Hospitality Review</h4>
                <p>Member of the Global Dining Alliance</p>
              </div>

              <div className={styles.verifiedIcon}>
                <FaCheckCircle />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
