import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

// extras
import authReducer from '../features/auth/authSlice';
import { restaurantApi } from '../services/restaurantApi';
import Header from './Header';
import styles from './Header.module.css';

function renderHeader(path: string) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      [restaurantApi.reducerPath]: restaurantApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(restaurantApi.middleware),
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Header />
      </MemoryRouter>
    </Provider>,
  );
}

describe('Header', () => {
  it('marks Restaurants active only on the restaurants listing page', () => {
    const { unmount } = renderHeader('/restaurants');

    expect(screen.getByRole('link', { name: 'Restaurants' })).toHaveClass(
      styles.active,
    );

    unmount();
    renderHeader('/restaurants/restaurant-1');

    expect(screen.getByRole('link', { name: 'Restaurants' })).not.toHaveClass(
      styles.active,
    );
  });
});
