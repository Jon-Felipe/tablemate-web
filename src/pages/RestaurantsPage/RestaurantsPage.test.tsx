import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { restaurantApi } from '../../services/restaurantApi';
import type { RestaurantListItem } from '../../types/restaurant';
import RestaurantsPage from './RestaurantsPage';

const restaurants: RestaurantListItem[] = Array.from({ length: 9 }, (_, index) => ({
  id: `restaurant-${index + 1}`,
  ownerId: 'owner-1',
  name: `Restaurant ${index + 1}`,
  slug: `restaurant-${index + 1}`,
  description: 'A neighborhood dining room.',
  cuisine: index === 1 ? 'Japanese' : 'Italian',
  priceLevel: index === 0 ? 10 : 2,
  coverImage: {
    id: `cover-${index + 1}`,
    restaurantId: `restaurant-${index + 1}`,
    imageUrl: `https://example.com/restaurant-${index + 1}.jpg`,
    altText: `Restaurant ${index + 1}`,
    type: 'MAIN',
    isPrimary: true,
    displayOrder: 1,
  },
  address: '1 Main Street',
  city: index === 0 ? 'Cape Town' : 'Johannesburg',
  postalCode: '2001',
  country: 'South Africa',
  latitude: -26.2041,
  longitude: 28.0473,
  phoneNumber: '+27115550123',
  email: 'hello@example.com',
  websiteUrl: 'https://example.com',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}));

function renderRestaurantsPage(data: RestaurantListItem[]) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ statusCode: 200, message: 'Success', data }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    ),
  );
  const store = configureStore({
    reducer: { [restaurantApi.reducerPath]: restaurantApi.reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(restaurantApi.middleware),
  });

  render(
    <Provider store={store}>
      <MemoryRouter>
        <RestaurantsPage />
      </MemoryRouter>
    </Provider>,
  );
  return store;
}

function getFilterSection(name: string) {
  const section = screen.getByRole('heading', { name }).closest('section');
  if (!section) {
    throw new Error(`Could not find the ${name} filter section.`);
  }
  return within(section);
}

describe('RestaurantsPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('derives distinct sorted filter options and counts from all restaurants', async () => {
    renderRestaurantsPage(restaurants);
    await screen.findByRole('heading', { name: 'Restaurant 1' });

    const cuisines = getFilterSection('Cuisine').getAllByRole('checkbox');
    expect(cuisines.map((checkbox) => checkbox.closest('label')?.textContent))
      .toEqual(['Italian8', 'Japanese1']);

    const cities = getFilterSection('City').getAllByRole('checkbox');
    expect(cities.map((checkbox) => checkbox.closest('label')?.textContent))
      .toEqual(['Cape Town1', 'Johannesburg8']);

    const prices = getFilterSection('Price Level').getAllByRole('checkbox');
    expect(prices.map((checkbox) => checkbox.closest('label')?.textContent))
      .toEqual(['$$', '$$$$$$$$$$']);
  });

  it('switches between grid and list without changing the displayed restaurants', async () => {
    const user = userEvent.setup();
    renderRestaurantsPage(restaurants);
    await screen.findByRole('heading', { name: 'Restaurant 1' });

    const gridButton = screen.getByRole('button', { name: 'Grid layout' });
    const listButton = screen.getByRole('button', { name: 'List layout' });
    expect(gridButton).toHaveAttribute('aria-pressed', 'true');
    expect(listButton).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getAllByRole('article')).toHaveLength(8);
    const names = screen.getAllByRole('article').map((card) =>
      within(card).getByRole('heading').textContent,
    );
    expect(names).toEqual(restaurants.slice(0, 8).map(({ name }) => name));

    await user.click(listButton);

    expect(gridButton).toHaveAttribute('aria-pressed', 'false');
    expect(listButton).toHaveAttribute('aria-pressed', 'true');
    const list = screen.getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(8);
    expect(within(list).getAllByRole('article').map((card) =>
      within(card).getByRole('heading').textContent,
    )).toEqual(names);
    expect(within(list).getByRole('heading', { name: 'Restaurant 1' }))
      .toBeInTheDocument();
    expect(within(list).getAllByRole('link', { name: 'View restaurant' })[0])
      .toHaveAttribute('href', '/restaurants/restaurant-1');
    expect(screen.queryByRole('heading', { name: 'Restaurant 9' }))
      .not.toBeInTheDocument();

    await user.click(gridButton);
    expect(gridButton).toHaveAttribute('aria-pressed', 'true');
    expect(listButton).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(8);
  });

  it('renders empty results and allows switching layouts', async () => {
    const user = userEvent.setup();
    const store = renderRestaurantsPage([]);
    await waitFor(() => {
      expect(
        restaurantApi.endpoints.getRestaurants.select()(store.getState()).isSuccess,
      ).toBe(true);
    });

    expect(screen.queryAllByRole('article')).toHaveLength(0);
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    await user.click(screen.getByRole('button', { name: 'List layout' }));
    expect(screen.getByRole('list')).toBeEmptyDOMElement();
    expect(screen.queryAllByRole('article')).toHaveLength(0);
  });
});
