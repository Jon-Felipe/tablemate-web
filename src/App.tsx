import { BrowserRouter, Route, Routes } from 'react-router';
import { ToastContainer } from 'react-toastify';

// pages
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import HomePage from './pages/HomePage/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import RestaurantsPage from './pages/RestaurantsPage/RestaurantsPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage/RestaurantDetailPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage/AboutPage';

// components
import SiteLayout from './components/SiteLayout';
import RequireAuth from './components/RequireAuth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route index element={<HomePage />} />
          <Route path='/restaurants' element={<RestaurantsPage />} />
          <Route path='restaurants/:id' element={<RestaurantDetailPage />} />
          <Route path='/about' element={<AboutPage />} />

          <Route element={<RequireAuth />}>
            <Route path='/profile' element={<ProfilePage />} />
          </Route>

          <Route path='*' element={<NotFoundPage />} />
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
