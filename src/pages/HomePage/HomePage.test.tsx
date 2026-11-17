import { configureStore } from '@reduxjs/toolkit';
import { render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

// extras
import { restaurantApi } from '../../services/restaurantApi';
import type { Restaurant } from '../../types/restaurant';
import HomePage from './HomePage';

const restaurants: Restaurant[] = Array.from({ length: 9 }, (_, index) => ({
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

  it('renders the hero, search controls, featured filters, and trust section', () => {
    mockRestaurantsResponse([]);

    renderHomePage();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Find your next favourite place.',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Cuisine or Spot')).toBeInTheDocument();
    expect(
      screen.getByText('Search restaurant, district...'),
    ).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('New York City')).toBeInTheDocument();
    expect(screen.getByText('Reservation')).toBeInTheDocument();
    expect(screen.getByText('Tonight, 2 guests')).toBeInTheDocument();
    expect(screen.getByText('Discover')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Explore restaurants' }),
    ).toBeInTheDocument();

    for (const filter of ['All', 'Top Rated', 'New', 'Nearby']) {
      expect(screen.getByText(filter)).toBeInTheDocument();
    }

    expect(
      screen.getByRole('heading', { name: 'Why Discerning Diners Trust Us' }),
    ).toBeInTheDocument();
  });

  it('renders featured restaurant details', async () => {
    mockRestaurantsResponse(restaurants.slice(0, 1));

    renderHomePage();

    await screen.findByRole('heading', { name: 'The Golden Fork' });
    const card = getRestaurantCard('The Golden Fork');

    expect(
      within(card).getByText('European'),
    ).toBeInTheDocument();
    expect(within(card).getByText('4.7')).toBeInTheDocument();
    expect(
      within(card).getByRole('img', {
        name: 'The Golden Fork',
      }),
    ).toHaveAttribute('src', 'https://example.com/restaurant-1.jpg');
    expect(
      within(card).getByText('A neighborhood dining room.'),
    ).toBeInTheDocument();
    expect(within(card).getByText(/View restaurant/)).toBeInTheDocument();
  });

  it('shows no more than eight featured restaurants', async () => {
    mockRestaurantsResponse(restaurants);

    renderHomePage();

    expect(
      await screen.findByRole('heading', { name: 'Restaurant 8' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Restaurant 9' }),
    ).not.toBeInTheDocument();
  });

  it('renders an empty restaurant grid when no restaurants are returned', async () => {
    mockRestaurantsResponse([]);

    renderHomePage();

    expect(
      await screen.findByRole('heading', { name: 'Explore restaurants' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'The Golden Fork' }),
    ).not.toBeInTheDocument();
  });
});
