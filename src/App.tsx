import { BrowserRouter, Route, Routes } from 'react-router';
import './App.css';

// pages
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';

// components
import SiteLayout from './components/SiteLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path='restaurants/:id' element={<RestaurantDetailPage />} />
          <Route path='*' element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
