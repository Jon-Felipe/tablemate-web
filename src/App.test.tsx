import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

// extras
import App from './App';
import { restaurantApi } from './services/restaurantApi';
import type { Restaurant } from './types/restaurant';

const restaurant: Restaurant = {
  id: 'restaurant-1',
  name: 'The Golden Fork',
  description: 'Modern European cuisine in a relaxed atmosphere.',
  cuisine: 'European',
  address: '12 Main Street',
  city: 'Johannesburg',
  rating: 4.7,
};

function createTestStore() {
  return configureStore({
    reducer: {
      [restaurantApi.reducerPath]: restaurantApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(restaurantApi.middleware),
  });
}

function mockFetchResponse(data: Restaurant | Restaurant[]) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = input instanceof Request ? input.url : String(input);

      return Promise.resolve(
        new Response(
          JSON.stringify({
            statusCode: 200,
            message: 'Success',
            data: url.endsWith('/restaurants/restaurant-1') ? restaurant : data,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );
    }),
  );
}

describe('App navigation', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3000/api/v1');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('should navigate from the restaurant listing to its details and back', async () => {
    const user = userEvent.setup();
    const store = createTestStore();

    mockFetchResponse([restaurant]);

    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );

    const restaurantLink = await screen.findByRole('link', {
      name: /The Golden Fork/,
    });

    expect(restaurantLink).toHaveAttribute('href', '/restaurants/restaurant-1');

    await user.click(restaurantLink);

    expect(
      await screen.findByRole('heading', { name: 'The Golden Fork' }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('link', { name: '← Back to restaurants' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Explore restaurants' }),
    ).toBeInTheDocument();
  });
});
