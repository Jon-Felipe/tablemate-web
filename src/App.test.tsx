import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

// extras
import App from './App';
import authReducer from './features/auth/authSlice';
import { restaurantApi } from './services/restaurantApi';
import type { Restaurant } from './types/restaurant';
import type { RestaurantMenu } from './types/restaurantMenu';

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

function mockFetchResponse(data: Restaurant | Restaurant[]) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = input instanceof Request ? input.url : String(input);

      let responseData: Restaurant | Restaurant[] | RestaurantMenu;

      if (url.endsWith('/restaurants/restaurant-1/menu')) {
        responseData = {
          restaurantId: 'restaurant-1',
          categories: [],
        } satisfies RestaurantMenu;
      } else if (url.endsWith('restaurants/restaurant-1')) {
        responseData = restaurant;
      } else {
        responseData = data;
      }

      return Promise.resolve(
        new Response(
          JSON.stringify({
            statusCode: 200,
            message: 'Success',
            data: responseData,
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
