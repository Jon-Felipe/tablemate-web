import { Outlet } from 'react-router';

// components
import Header from './Header';
import Footer from './Footer';

function SiteLayout() {
  return (
    <div className='app'>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default SiteLayout;
