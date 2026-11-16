import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { FaApple, FaArrowRight, FaCheck } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

// extrs
import styles from './RegisterPage.module.css';
import { useAuth } from '../../features/auth/useAuth';

type cities = 'Johannesburg' | 'Cape Town' | 'Durban' | 'Pretoria';

function RegisterPage() {
  const { register, isRegistering } = useAuth();
  const navigate = useNavigate();

  const [location, setLocation] = useState<cities>('Johannesburg');

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fullname = formData.get('fullname')?.toString().trim();
    const email = formData.get('email')?.toString().trim();
    const password = formData.get('password')?.toString();

    if (!fullname || !email || !password) {
      alert('Please fill in all required fields.');
      return;
    }

    if (password.length < 12) {
      alert('Password must be at least 12 characters long.');
      return;
    }

    try {
      await register({ name: fullname, email, password });
      navigate('/login');
    } catch (error: any) {
      alert(error?.data?.message || 'An error occurred during registration.');
    }
  }

  return (
    <div className={styles.signupPage}>
      <div className={styles.signupContainer}>
        <header className={styles.signupHeader}>
          <h1>Create Your Account</h1>
          <p>
            Join our private guest network for seamless booking and bespoke
            dining.
          </p>
        </header>

        {/* Social Sign Up */}
        <div className={styles.socialButtons}>
          <button type='button' className={styles.socialBtn}>
            <FcGoogle className={styles.googleIcon} aria-hidden='true' />
            <span>Google</span>
          </button>

          <button type='button' className={styles.socialBtn}>
            <FaApple className={styles.appleIcon} aria-hidden='true' />
            <span>Apple</span>
          </button>
        </div>

        {/* Divider */}
        <div className={styles.divider}>
          <span />
          <p>OR WITH EMAIL</p>
          <span />
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className={styles.signupForm}>
          <div className={styles.formGroup}>
            <label htmlFor='fullname'>FULL NAME</label>
            <input
              type='text'
              id='fullname'
              name='fullname'
              placeholder='John Doe'
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor='email'>EMAIL ADDRESS</label>
            <input
              type='email'
              id='email'
              name='email'
              placeholder='example@example.com'
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor='password'>PASSWORD</label>

            <div className={styles.passwordField}>
              <input
                type='password'
                id='password'
                name='password'
                placeholder='Create a password'
                required
              />
            </div>
          </div>

          {/* Primary Metropolis */}
          <div className={`${styles.formGroup} ${styles.cityGroup}`}>
            <label>PRIMARY METROPOLIS</label>

            <div className={styles.cityOptions}>
              <button
                type='button'
                className={`${styles.cityOption} ${location === 'Johannesburg' ? styles.active : ''}`}
                onClick={() => setLocation('Johannesburg')}
              >
                Johannesburg
              </button>

              <button
                type='button'
                className={`${styles.cityOption} ${location === 'Cape Town' ? styles.active : ''}`}
                onClick={() => setLocation('Cape Town')}
              >
                Cape Town
              </button>

              <button
                type='button'
                className={`${styles.cityOption} ${location === 'Durban' ? styles.active : ''}`}
                onClick={() => setLocation('Durban')}
              >
                Durban
              </button>

              <button
                type='button'
                className={`${styles.cityOption} ${location === 'Pretoria' ? styles.active : ''}`}
                onClick={() => setLocation('Pretoria')}
              >
                Pretoria
              </button>
            </div>
          </div>

          {/* Terms */}
          <div className={styles.terms}>
            <span className={styles.checkIcon} aria-hidden='true'>
              <FaCheck />
            </span>

            <p>
              By registering, you accept the{' '}
              <a href='#'>Terms of Hospitality</a> and{' '}
              <a href='#'>Privacy Policy</a>.
            </p>
          </div>

          {/* Submit */}
          <button
            type='submit'
            className={styles.submitBtn}
            disabled={isRegistering}
          >
            {isRegistering ? 'Creating Account...' : 'Create Account'}
            <FaArrowRight aria-hidden='true' />
          </button>
        </form>

        {/* Login Footer */}
        <div className={styles.loginFooter}>
          <p>
            Already a member? <Link to='/login'>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
