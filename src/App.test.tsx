import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

// extras
import App from './App';
import authReducer from './features/auth/authSlice';
import { restaurantApi } from './services/restaurantApi';
import type { RestaurantListItem } from './types/restaurant';

const restaurant: RestaurantListItem = {
  id: 'restaurant-1',
  ownerId: 'owner-1',
  name: 'The Golden Fork',
  slug: 'the-golden-fork',
  description: 'Modern European cuisine in a relaxed atmosphere.',
  cuisine: 'European',
  priceLevel: 3,
  coverImage: {
    id: 'cover-1',
    restaurantId: 'restaurant-1',
    imageUrl: 'https://example.com/cover.jpg',
    altText: 'The Golden Fork',
    type: 'MAIN',
    isPrimary: true,
    displayOrder: 1,
  },
  address: '12 Main Street',
  city: 'Johannesburg',
  postalCode: '2001',
  country: 'South Africa',
  latitude: -26.2041,
  longitude: 28.0473,
  phoneNumber: '+27115550123',
  email: 'hello@example.com',
  websiteUrl: 'https://example.com',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
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

function mockFetchResponse(data: RestaurantListItem[]) {
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
