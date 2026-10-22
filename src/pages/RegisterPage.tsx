import { useState } from 'react';
import { Link } from 'react-router';

// extras
import { useAuth } from '../features/auth/useAuth';

function RegisterPage() {
  const { register, isRegistering } = useAuth();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  async function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault();
    setError(null);
    setIsRegistered(false);

    try {
      await register({ name: name.trim(), email: email.trim(), password });

      setIsRegistered(true);
    } catch {
      setError(
        'Unable to create your account. Please check your details and try again.',
      );
    }
  }

  if (isRegistered) {
    return (
      <main className='auth-page'>
        <section className='auth-form-container'>
          <h1>Account created!</h1>

          <p>
            Your TableMate account has been created successfully. You can now
            log in with your email and password.
          </p>

          <Link to='/login' className='auth-action-link'>
            Log in to your account
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className='auth-page'>
      <section className='auth-form-container'>
        <h1>Create your account</h1>
        <p>Join TableMate and discover your next favourite restaurant.</p>

        <form onSubmit={handleSubmit}>
          <div className='form-field'>
            <label htmlFor='name'>Full name</label>
            <input
              id='name'
              name='name'
              type='text'
              autoComplete='name'
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className='form-field'>
            <label htmlFor='email'>Email address</label>
            <input
              id='email'
              name='email'
              type='email'
              autoComplete='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className='form-field'>
            <label htmlFor='password'>Password</label>
            <input
              id='password'
              name='password'
              type='password'
              autoComplete='new-password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && (
            <p role='alert' className='auth-error'>
              {error}
            </p>
          )}

          <button type='submit' disabled={isRegistering}>
            {isRegistering ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p>
          Already have an account? <Link to='/login'>Log in</Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;
