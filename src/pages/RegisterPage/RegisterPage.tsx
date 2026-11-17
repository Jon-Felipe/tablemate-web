import { Link, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import {
  FaApple,
  FaUser,
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaHistory,
  FaUtensils,
  FaCheckCircle,
} from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

// extrs
import styles from './RegisterPage.module.css';
import { useAuth } from '../../features/auth/useAuth';

function RegisterPage() {
  const { register, isRegistering } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fullname = formData.get('fullname')?.toString().trim();
    const email = formData.get('email')?.toString().trim();
    const password = formData.get('password')?.toString();
    const confirmPassword = formData.get('confirmPassword')?.toString();

    if (!fullname || !email || !password || !confirmPassword) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (password.length < 12) {
      toast.error('Password must be at least 12 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      await register({ name: fullname, email, password });
      navigate('/login');
    } catch (error: any) {
      toast.error(
        error?.data?.message || 'An error occurred during registration.',
      );
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
              <h1>Create your account.</h1>
              <p>
                Join a global community of food lovers, unlock private
                reservations, and save personal dining collections.
              </p>
            </div>

            <div className={styles.socialButtons}>
              <button type='button'>
                <FcGoogle className={styles.googleIcon} />
                Continue with Google
              </button>

              <button type='button'>
                <FaApple className={styles.appleIcon} />
                Continue with Apple
              </button>
            </div>

            <div className={styles.divider}>
              <span />
              <p>OR REGISTER WITH EMAIL</p>
              <span />
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label>Full Name</label>
                <div className={styles.inputWrapper}>
                  <FaUser />
                  <input
                    type='text'
                    name='fullname'
                    placeholder='e.g., John Doe'
                    required
                  />
                </div>
              </div>

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
                <div className={styles.labelRow}>
                  <label>Password</label>
                  <span>Minimum 12 characters</span>
                </div>

                <div className={styles.inputWrapper}>
                  <FaLock />
                  <input
                    type='password'
                    name='password'
                    placeholder='Minimum 12 characters'
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Confirm Password</label>
                <div className={styles.inputWrapper}>
                  <FaHistory />
                  <input
                    type='password'
                    name='confirmPassword'
                    placeholder='Re-enter your password'
                    required
                  />
                </div>
              </div>

              <div className={styles.terms}>
                <input type='checkbox' />
                <p>
                  I agree to TableMate's <a href='#terms'>Terms of Service</a>{' '}
                  and <a href='#privacy'>Privacy Policy</a>.
                </p>
              </div>

              <button
                type='submit'
                className={styles.submitButton}
                disabled={isRegistering}
              >
                {isRegistering ? 'Creating account...' : 'Create account'}{' '}
                <FaArrowRight />
              </button>
            </form>
          </div>

          <footer className={styles.formFooter}>
            <span>Already a member?</span>
            <Link to='/login'>
              Sign in instead <FaArrowRight />
            </Link>
          </footer>
        </section>

        {/* RIGHT SIDE */}
        <section className={styles.editorialSection}>
          <div className={styles.editorialOverlay} />

          <div className={styles.testimonialCard}>
            <div className={styles.stars}>★★★★★</div>

            <blockquote>
              “TableMate reshaped how we discover neighborhood trattorias and
              reserve chef counters without the frantic booking rush.”
            </blockquote>

            <div className={styles.testimonialDivider} />

            <div className={styles.testimonialAuthor}>
              <div>
                <h4>Julien & Elena Vance</h4>
                <p>Food Writers • Copenhagen</p>
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

export default RegisterPage;
