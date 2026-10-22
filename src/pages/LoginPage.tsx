import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';

// extras
import { useAuth } from '../features/auth/useAuth';

function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoggingIn } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await login({ email: email.trim(), password });
      navigate('/', { replace: true });
    } catch {
      setError('Unable to log in. Check your credentials and try again.');
    }
  }

  return (
    <main className='auth-page'>
      <section className='auth-form-container'>
        <h1>Log in to TableMate</h1>
        <p>Sign in to your account to continue.</p>

        <form onSubmit={handleSubmit}>
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
              autoComplete='current-password'
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

          <button type='submit' disabled={isLoggingIn}>
            {isLoggingIn ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p>
          New to TableMate? <Link to='/register'>Create an account</Link>
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
