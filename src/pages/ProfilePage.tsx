import { useAuth } from '../features/auth/useAuth';
import { useGetCurrentUserQuery } from '../services/restaurantApi';

function ProfilePage() {
  const { accessToken, logout } = useAuth();

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCurrentUserQuery(accessToken ?? '', { skip: !accessToken });

  const isUnauthorized =
    isError &&
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    error.status === 401;

  if (!accessToken) {
    return (
      <main className='profile-page'>
        <section className='profile-card' aria-labelledby='profile-title'>
          <header className='profile-header'>
            <h1 id='profile-title'>Your profile</h1>
          </header>

          <div className='profile-message' role='alert'>
            <p>You need to log in to view your profile.</p>
            <button
              type='button'
              className='button button-primary'
              onClick={logout}
            >
              Log out
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className='profile-page'>
      <section className='profile-card' aria-labelledby='profile-title'>
        <header className='profile-header'>
          <p className='profile-eyebrow'>YOUR TABLEMATE ACCOUNT</p>
          <h1 id='profile-title'>Your profile</h1>
          <p className='profile-description'>View your account details.</p>
        </header>

        {isLoading && (
          <p className='profile-status' role='status'>
            Loading your profile...
          </p>
        )}

        {isUnauthorized && (
          <div className='profile-message' role='alert'>
            <p>
              Your session has expired or is no longer valid. Please log in
              again to view your profile.
            </p>
            <button
              type='button'
              className='button button-primary'
              onClick={logout}
            >
              Log out
            </button>
          </div>
        )}

        {isError && !isUnauthorized && (
          <div className='profile-message' role='alert'>
            <p>We couldn't load your profile. Please try again.</p>
            <button
              type='button'
              className='button button-primary'
              onClick={() => void refetch()}
            >
              Try again
            </button>
          </div>
        )}

        {user && !isError && (
          <dl className='profile-details'>
            <div className='profile-detail'>
              <dt>Full name</dt>
              <dd>{user.name}</dd>
            </div>

            <div className='profile-detail'>
              <dt>Email address</dt>
              <dd>{user.email}</dd>
            </div>

            <div className='profile-detail'>
              <dt>Account type</dt>
              <dd className='profile-role'>{user.role}</dd>
            </div>
          </dl>
        )}

        <footer className='profile-footer'>
          <button
            type='button'
            className='button button-secondary'
            onClick={logout}
          >
            Log out
          </button>
        </footer>
      </section>
    </main>
  );
}

export default ProfilePage;
