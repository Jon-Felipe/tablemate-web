import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

// extras
import App from './App';
import authReducer from './features/auth/authSlice';
import { restaurantApi } from './services/restaurantApi';
import type { Restaurant } from './types/restaurant';

const restaurant: Restaurant = {
  id: 'restaurant-1',
  name: 'The Golden Fork',
  imageUrl:
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  description: 'Modern European cuisine in a relaxed atmosphere.',
  cuisine: 'European',
  address: '12 Main Street',
  city: 'Johannesburg',
  rating: 4.7,
};

function createTestStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      [restaurantApi.reducerPath]: restaurantApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(restaurantApi.middleware),
  });
}

function mockFetchResponse(data: Restaurant[]) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          statusCode: 200,
          message: 'Success',
          data,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    ),
  );
}

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('renders the homepage and its featured restaurant', async () => {
    const store = createTestStore();

    mockFetchResponse([restaurant]);

    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Find your next favourite place.',
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'The Golden Fork' }),
    ).toBeInTheDocument();
  });
});
