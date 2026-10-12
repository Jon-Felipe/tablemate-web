import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import type { Restaurant } from '../types/restaurant';
import HomePage from './HomePage';
import { restaurantApi } from '../services/restaurantApi';

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

function renderHomePage() {
  const store = createTestStore();

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </Provider>,
  );
}

function mockFetchResponse(data: Restaurant[], status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          statusCode: status,
          message: 'Success',
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

describe('HomePage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('should show loading state while restaurants are being fetched', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    );

    renderHomePage();

    expect(screen.getByRole('status')).toHaveTextContent('Loading restaurants');
  });

  it('should render restaurant cards when loading succeeds', async () => {
    mockFetchResponse([restaurant]);

    renderHomePage();

    expect(
      await screen.findByRole('heading', { name: 'The Golden Fork' }),
    ).toBeInTheDocument();
    expect(screen.getByText('European')).toBeInTheDocument();
    expect(
      screen.getByText('12 Main Street, Johannesburg'),
    ).toBeInTheDocument();
    expect(screen.getByText('4.7')).toBeInTheDocument();
  });

  it('should show an empty state when no restaurants are returned', async () => {
    mockFetchResponse([]);

    renderHomePage();

    expect(
      await screen.findByRole('heading', { name: 'No restaurants yet' }),
    ).toBeInTheDocument();
  });

  it('should show an error message when loading fails', async () => {
    mockFetchResponse([], 500);

    renderHomePage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to load restaurants. Please try again.',
    );
  });

  it('should link each restaurant card to its detail page', async () => {
    mockFetchResponse([restaurant]);

    renderHomePage();

    const cardLink = await screen.findByRole('link', {
      name: /The Golden Fork/,
    });

    expect(cardLink).toHaveAttribute('href', '/restaurants/restaurant-1');
  });
});
