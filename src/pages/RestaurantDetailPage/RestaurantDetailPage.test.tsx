import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { toast } from 'react-toastify';

import type { RestaurantDetails } from '../../types/restaurant';
import RestaurantDetailPage from './RestaurantDetailPage';
import { restaurantApi } from '../../services/restaurantApi';
import type { RestaurantMenu } from '../../types/restaurantMenu';
import authReducer, { setCredentials } from '../../features/auth/authSlice';

const restaurant: RestaurantDetails = {
  id: 'restaurant-1',
  ownerId: 'owner-1',
  name: 'The Golden Fork',
  slug: 'the-golden-fork',
  description: 'Modern European cuisine in a relaxed atmosphere.',
  cuisine: 'European',
  priceLevel: 3,
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
  images: [
    {
      id: 'main-1',
      restaurantId: 'restaurant-1',
      imageUrl: 'https://example.com/main.jpg',
      altText: 'Main dining room',
      type: 'MAIN',
      isPrimary: true,
      displayOrder: 0,
    },
    {
      id: 'interior-1',
      restaurantId: 'restaurant-1',
      imageUrl: 'https://example.com/interior.jpg',
      altText: 'Restaurant interior',
      type: 'INTERIOR',
      isPrimary: false,
      displayOrder: 1,
    },
  ],
  information: [
    {
      id: 'info-1',
      restaurantId: 'restaurant-1',
      type: 'DRESS_CODE',
      title: 'Dress Code',
      description: 'Smart casual.',
      icon: 'shirt',
      displayOrder: 1,
    },
  ],
  features: [
    {
      id: 'feature-1',
      restaurantId: 'restaurant-1',
      title: 'Outdoor Seating',
      description: 'Enjoy the garden patio.',
      icon: 'leaf',
      displayOrder: 1,
    },
  ],
  awards: [
    {
      id: 'restaurant-award-1',
      restaurantId: 'restaurant-1',
      awardId: 'award-1',
      year: 2025,
      award: {
        id: 'award-1',
        name: 'Local Dining Award',
        icon: 'trophy',
      },
    },
  ],
};

const menu: RestaurantMenu = {
  id: 'menu-1',
  restaurantId: 'restaurant-1',
  name: 'Dinner Menu',
  type: 'DINNER',
  isActive: true,
  categories: [
    {
      id: 'starters',
      menuId: 'menu-1',
      name: 'Starters',
      displayOrder: 1,
      items: [
        {
          id: 'starter-1',
          categoryId: 'starters',
          name: 'Roasted Tomato Soup',
          description: 'Tomatoes and fresh herbs.',
          price: 65,
          currency: 'ZAR',
          imageUrl: 'https://example.com/soup.jpg',
          isAvailable: true,
          displayOrder: 1,
        },
      ],
    },
  ],
};

function createTestStore(isAuthenticated = false) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      [restaurantApi.reducerPath]: restaurantApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(restaurantApi.middleware),
  });

  if (isAuthenticated) {
    store.dispatch(
      setCredentials({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'CUSTOMER',
        },
        accessToken: 'token',
      }),
    );
  }

  return store;
}

function renderRestaurantDetailPage(
  id = 'restaurant-1',
  isAuthenticated = false,
  initialEntries = [`/restaurants/${id}`],
) {
  const store = createTestStore(isAuthenticated);

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries} initialIndex={initialEntries.length - 1}>
        <Routes>
          <Route path='/restaurants' element={<h1>Restaurants</h1>} />
          <Route path='/restaurants/:id' element={<RestaurantDetailPage />} />
          <Route path='/login' element={<h1>Login</h1>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

function mockFetchResponse(
  options: {
    restaurantData?: RestaurantDetails;
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
    vi.restoreAllMocks();
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
      screen.getByText('12 Main Street, Johannesburg, South Africa'),
    ).toBeInTheDocument();
    expect(screen.getByText('Local Dining Award 2025')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Main dining room' })).toHaveAttribute(
      'src',
      'https://example.com/main.jpg',
    );
    expect(screen.getByText('Outdoor Seating')).toBeInTheDocument();
    expect(screen.getByText('Smart casual.')).toBeInTheDocument();
    expect(screen.getByText('Modern European cuisine in a relaxed atmosphere.'))
      .toBeInTheDocument();
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
    expect(screen.getByText(/R\s?65[.,]00/)).toBeInTheDocument();
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

  it('returns to the previous page from the restaurant details page', async () => {
    mockFetchResponse();

    renderRestaurantDetailPage('restaurant-1', false, [
      '/restaurants',
      '/restaurants/restaurant-1',
    ]);
    await screen.findByRole('heading', { name: 'The Golden Fork' });
    await userEvent.click(screen.getByRole('button', { name: 'Go back' }));

    expect(
      await screen.findByRole('heading', { name: 'Restaurants' }),
    ).toBeInTheDocument();
  });

  it('redirects to login when an unauthenticated user submits a reservation', async () => {
    mockFetchResponse();
    const toastError = vi.spyOn(toast, 'error').mockImplementation(() => 1);

    renderRestaurantDetailPage();
    await screen.findByRole('heading', { name: 'The Golden Fork' });
    await userEvent.click(
      screen.getByRole('button', { name: /Confirm Booking/ }),
    );

    expect(toastError).toHaveBeenCalledWith(
      'Please log in to reserve a table.',
    );
    expect(
      await screen.findByRole('heading', { name: 'Login' }),
    ).toBeInTheDocument();
  });

  it('requires all reservation fields for an authenticated user', async () => {
    mockFetchResponse();
    const toastError = vi.spyOn(toast, 'error').mockImplementation(() => 1);

    renderRestaurantDetailPage('restaurant-1', true);
    await screen.findByRole('heading', { name: 'The Golden Fork' });
    fireEvent.change(screen.getByLabelText('Reservation date'), {
      target: { value: '' },
    });
    await userEvent.click(
      screen.getByRole('button', { name: /Confirm Booking/ }),
    );

    expect(toastError).toHaveBeenCalledWith(
      'Please fill in all reservation fields.',
    );
  });

  it('rejects reservation dates in the past', async () => {
    mockFetchResponse();
    const toastError = vi.spyOn(toast, 'error').mockImplementation(() => 1);

    renderRestaurantDetailPage('restaurant-1', true);
    await screen.findByRole('heading', { name: 'The Golden Fork' });
    fireEvent.change(screen.getByLabelText('Reservation date'), {
      target: { value: '2020-01-01' },
    });
    await userEvent.click(screen.getByRole('button', { name: '7:15 PM' }));
    await userEvent.click(
      screen.getByRole('button', { name: /Confirm Booking/ }),
    );

    expect(toastError).toHaveBeenCalledWith(
      'Please select today or a future date.',
    );
  });
});
