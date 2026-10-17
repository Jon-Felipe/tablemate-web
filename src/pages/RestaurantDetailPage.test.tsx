import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import type { Restaurant } from '../types/restaurant';
import RestaurantDetailPage from './RestaurantDetailPage';
import { restaurantApi } from '../services/restaurantApi';
import type { RestaurantMenu } from '../types/restaurantMenu';

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

const menu: RestaurantMenu = {
  restaurantId: 'restaurant-1',
  categories: [
    {
      id: 'starters',
      name: 'Starters',
      items: [
        {
          id: 'starter-1',
          name: 'Roasted Tomato Soup',
          description: 'Tomatoes and fresh herbs.',
          price: 65,
          imageUrl: 'https://example.com/soup.jpg',
        },
      ],
    },
  ],
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

function mockFetchResponse(
  options: {
    restaurantData?: Restaurant;
    menuData?: RestaurantMenu;
    restaurantStatus?: number;
    menuStatus?: number;
  } = {},
) {
  const {
    restaurantData = restaurant,
    menuData = menu,
    restaurantStatus = 200,
    menuStatus = 200,
  } = options;

  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL) => {
      const url = input instanceof Request ? input.url : String(input);

      const isMenuRequest = /\/restaurants\/[^/]+\/menu(?:\?|$)/.test(url);
      const status = isMenuRequest ? menuStatus : restaurantStatus;

      const data = isMenuRequest ? menuData : restaurantData;

      return Promise.resolve(
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
      );
    }),
  );
}

function mockPendingFetch() {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => new Promise<Response>(() => {})),
  );
}

describe('RestaurantDetailPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('should show loading state while the restaurant is being fetched', () => {
    mockPendingFetch();

    renderRestaurantDetailPage();

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading restaurant...',
    );
  });

  it('should render restaurant details when loading succeeds', async () => {
    mockFetchResponse();

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

  it('should render the restaurant menu and its items', async () => {
    mockFetchResponse();

    renderRestaurantDetailPage();

    expect(
      await screen.findByRole('heading', { name: 'Roasted Tomato Soup' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Menu' })).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'Starters' }),
    ).toBeInTheDocument();

    expect(screen.getByText('Tomatoes and fresh herbs.')).toBeInTheDocument();
    expect(screen.getByText(/R\s?65\,00/)).toBeInTheDocument();
  });

  it('should show the menu loading state', () => {
    mockPendingFetch();

    renderRestaurantDetailPage();

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading restaurant...',
    );
  });

  it('should show a not-found state when the restaurant does not exist', async () => {
    mockFetchResponse({ restaurantStatus: 404 });

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

  it('should show an error message when the menu request fails', async () => {
    mockFetchResponse({ menuStatus: 500 });

    renderRestaurantDetailPage();

    expect(
      await screen.findByText('Unable to load this menu. Please try again.'),
    ).toBeInTheDocument();
  });

  it('should show a fallback when the menu has no categories', async () => {
    mockFetchResponse({
      menuData: {
        ...menu,
        categories: [],
      },
    });

    renderRestaurantDetailPage();

    expect(
      await screen.findByText("This restaurant's menu is coming soon."),
    ).toBeInTheDocument();
  });

  it('should provide a link back to the restaurant listing', async () => {
    mockPendingFetch();

    renderRestaurantDetailPage();

    expect(
      screen.getByRole('link', { name: /Back to restaurants/ }),
    ).toHaveAttribute('href', '/');
  });
});
