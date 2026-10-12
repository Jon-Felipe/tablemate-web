import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import type { Restaurant } from '../types/restaurant';
import RestaurantDetailPage from './RestaurantDetailPage';
import { restaurantApi } from '../services/restaurantApi';

vi.mock('../api/restaurants', () => ({
  getRestaurantById: vi.fn(),
  RestaurantNotFoundError: class RestaurantNotFoundError extends Error {
    constructor() {
      super('Restaurant not found');
      this.name = 'RestaurantNotFoundError';
    }
  },
}));

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

function renderRestaurantDetailPage(id = 'restaurant-1') {
  const store = createTestStore();

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/restaurants/${id}`]}>
        <Routes>
          <Route path='/restaurants/:id' element={<RestaurantDetailPage />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

function mockFetchResponse(data: Restaurant, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          statusCode: status,
          message: status === 404 ? 'Not Found' : 'Success',
          data,
        }),
        {
          status,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    ),
  );
}

describe('RestaurantDetailPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('should show loading state while the restaurant is being fetched', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    );

    renderRestaurantDetailPage();

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading restaurant...',
    );
  });

  it('should render restaurant details when loading succeeds', async () => {
    mockFetchResponse(restaurant);

    renderRestaurantDetailPage();

    expect(
      await screen.findByRole('heading', { name: 'The Golden Fork' }),
    ).toBeInTheDocument();
    expect(screen.getByText('European')).toBeInTheDocument();
    expect(
      screen.getByText('12 Main Street, Johannesburg'),
    ).toBeInTheDocument();
    expect(screen.getByText('4.7')).toBeInTheDocument();
  });

  it('should show a not-found state when the restaurant does not exist', async () => {
    mockFetchResponse(
      {
        ...restaurant,
        id: 'missing',
      },
      404,
    );

    renderRestaurantDetailPage('missing');

    expect(
      await screen.findByRole('heading', { name: 'Restaurant not found' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Browse restaurants' }),
    ).toHaveAttribute('href', '/');
  });

  it('should show an error message when the request fails unexpectedly', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Network faliuer')),
    );

    renderRestaurantDetailPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to load this restaurant. Please try again.',
    );
  });

  it('should provide a link back to the restaurant listing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise<Response>(() => {})),
    );

    renderRestaurantDetailPage();

    expect(
      screen.getByRole('link', { name: /Back to restaurants/ }),
    ).toHaveAttribute('href', '/');
  });
});
