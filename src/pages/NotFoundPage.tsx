import { Link } from 'react-router';

function NotFoundPage() {
  return (
    <main className='detail-section'>
      <div className='empty-state'>
        <h1>Page not found</h1>
        <p>The page you requested doesn't exist.</p>
        <Link to='/' className='primary-button'>
          Return home
        </Link>
      </div>
    </main>
  );
}

export default NotFoundPage;
