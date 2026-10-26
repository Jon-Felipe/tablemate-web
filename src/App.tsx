import { BrowserRouter, Route, Routes } from 'react-router';
import './App.css';

// pages
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import ProfilePage from './pages/ProfilePage';

// components
import SiteLayout from './components/SiteLayout';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route index element={<HomePage />} />
          <Route path='restaurants/:id' element={<RestaurantDetailPage />} />
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='*' element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
