import { configureStore } from '@reduxjs/toolkit';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

// extras
import { restaurantApi } from '../../services/restaurantApi';
import type { Restaurant } from '../../types/restaurant';
import HomePage from './HomePage';

const restaurants: Restaurant[] = Array.from({ length: 7 }, (_, index) => ({
  id: `restaurant-${index + 1}`,
  name: index === 0 ? 'The Golden Fork' : `Restaurant ${index + 1}`,
  imageUrl: `https://example.com/restaurant-${index + 1}.jpg`,
  description: 'A neighborhood dining room.',
  cuisine: index === 0 ? 'European' : 'Italian',
  address: `${index + 1} Main Street`,
  city: 'Johannesburg',
  rating: index === 0 ? 4.7 : 4.2,
}));

function renderHomePage() {
  const store = configureStore({
    reducer: {
      [restaurantApi.reducerPath]: restaurantApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(restaurantApi.middleware),
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </Provider>,
  );
}

function mockRestaurantsResponse(data: Restaurant[]) {
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
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    ),
  );
}

function getRestaurantCard(name: string): HTMLElement {
  const heading = screen.getByRole('heading', { name });
  const card = heading.closest<HTMLElement>('article');

  if (!card) {
    throw new Error(`Could not find a card for restaurant "${name}".`);
  }

  return card;
}

describe('HomePage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the hero, search controls, trending tags, and trust section', () => {
    mockRestaurantsResponse([]);

    renderHomePage();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Discover great restaurantsMake every meal memorable.',
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('CUISINE OR VIBE')).toHaveAttribute(
      'placeholder',
      'Osteria, omakase, natural wine...',
    );
    expect(screen.getByLabelText('LOCATION')).toHaveValue(
      'SoHo & Downtown, NY',
    );
    expect(screen.getByLabelText('DATE')).toHaveAttribute('type', 'date');
    expect(screen.getByLabelText('PARTY')).toHaveValue('2');
    expect(
      screen.getByRole('button', { name: /Find a Table/ }),
    ).toBeInTheDocument();

    for (const trend of ['Omakase', 'Natural Wine', 'Ramen', 'Vegan']) {
      expect(screen.getByRole('button', { name: trend })).toBeInTheDocument();
    }

    expect(
      screen.getByRole('heading', { name: 'Why Discerning Diners Trust Us' }),
    ).toBeInTheDocument();
  });

  it('links each popular cuisine to its filtered restaurant listing', () => {
    mockRestaurantsResponse([]);

    renderHomePage();

    expect(
      screen.getByRole('heading', { name: 'Explore Popular Cuisines' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Italian/ })).toHaveAttribute(
      'href',
      '/restaurants?cuisine=Italian',
    );
    expect(screen.getByRole('link', { name: /Japanese/ })).toHaveAttribute(
      'href',
      '/restaurants?cuisine=Japanese',
    );
    expect(screen.getByRole('link', { name: /Seafood/ })).toHaveAttribute(
      'href',
      '/restaurants?cuisine=Seafood',
    );
  });

  it('renders featured restaurants with their details and navigation links', async () => {
    mockRestaurantsResponse(restaurants.slice(0, 1));

    renderHomePage();

    await screen.findByRole('heading', { name: 'The Golden Fork' });
    const card = getRestaurantCard('The Golden Fork');

    expect(
      within(card).getByText('European • Johannesburg'),
    ).toBeInTheDocument();
    expect(within(card).getByText('4.7')).toBeInTheDocument();
    expect(
      within(card).getByRole('img', {
        name: 'Food and dining at The Golden Fork',
      }),
    ).toHaveAttribute('src', 'https://example.com/restaurant-1.jpg');
    expect(
      within(card).getByRole('link', { name: 'View Details' }),
    ).toHaveAttribute('href', '/restaurants/restaurant-1');
    expect(
      within(card).getByRole('link', { name: 'Reserve Table' }),
    ).toHaveAttribute('href', '/restaurants/restaurant-1');
    expect(within(card).getByText('Popular Today')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /View All venues/ }),
    ).toHaveAttribute('href', '/restaurants');
  });

  it('toggles a restaurant favorite without changing other cards', async () => {
    const user = userEvent.setup();
    mockRestaurantsResponse(restaurants.slice(0, 2));

    renderHomePage();

    await screen.findByRole('heading', { name: 'The Golden Fork' });
    const firstCard = getRestaurantCard('The Golden Fork');
    const secondCard = getRestaurantCard('Restaurant 2');
    const favoriteButton = within(firstCard).getByRole('button', {
      name: 'Add to favorites',
    });

    await user.click(favoriteButton);

    expect(
      within(firstCard).getByRole('button', { name: 'Remove from favorites' }),
    ).toContainHTML('<svg');
    expect(
      within(secondCard).getByRole('button', { name: 'Add to favorites' }),
    ).toContainHTML('<svg');
  });

  it('shows no more than six featured restaurants', async () => {
    mockRestaurantsResponse(restaurants);

    renderHomePage();

    expect(
      await screen.findByRole('heading', { name: 'Restaurant 6' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Restaurant 7' }),
    ).not.toBeInTheDocument();
  });

  it('omits the featured section when no restaurants are returned', async () => {
    mockRestaurantsResponse([]);

    renderHomePage();

    expect(
      await screen.findByRole('heading', { name: 'Explore Popular Cuisines' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Featured Dining Rooms' }),
    ).not.toBeInTheDocument();
  });
});
