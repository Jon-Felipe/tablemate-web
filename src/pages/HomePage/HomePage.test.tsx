import { configureStore } from '@reduxjs/toolkit';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { ToastContainer } from 'react-toastify';
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
        <ToastContainer />
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
      screen.getByRole('textbox', { name: 'Cuisine or Spot' }),
    ).toHaveAttribute('placeholder', 'Search restaurant, district...');
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'Location' }),
    ).toHaveValue('');
    expect(
      screen.getByRole('option', { name: 'Cape Town' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Guests' })).toHaveValue('2');
    expect(screen.getByRole('button', { name: 'Discover' })).toBeInTheDocument();
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

  it('allows typing a restaurant or district into the search field', async () => {
    mockRestaurantsResponse([]);

    renderHomePage();

    const searchInput = screen.getByRole('textbox', {
      name: 'Cuisine or Spot',
    });
    await userEvent.type(searchInput, 'Italian restaurant');

    expect(searchInput).toHaveValue('Italian restaurant');
  });

  it('allows selecting a South African city in the location field', async () => {
    mockRestaurantsResponse([]);

    renderHomePage();

    const locationSelect = screen.getByRole('combobox', { name: 'Location' });
    await userEvent.selectOptions(locationSelect, 'Johannesburg');

    expect(locationSelect).toHaveValue('Johannesburg');
  });

  it('allows selecting between one and ten guests', async () => {
    mockRestaurantsResponse([]);

    renderHomePage();

    const guestSelect = screen.getByRole('combobox', { name: 'Guests' });
    expect(within(guestSelect).getAllByRole('option')).toHaveLength(10);
    await userEvent.selectOptions(guestSelect, '1');
    expect(guestSelect).toHaveValue('1');
    expect(
      within(guestSelect).getByRole('option', { name: '1 guest' }),
    ).toHaveProperty('selected', true);
    await userEvent.selectOptions(guestSelect, '10');
    expect(guestSelect).toHaveValue('10');
    expect(
      within(guestSelect).getByRole('option', { name: '10 guests' }),
    ).toHaveProperty('selected', true);
  });

  it('shows a toast when Discover is submitted with missing search fields', async () => {
    mockRestaurantsResponse([]);

    renderHomePage();

    await userEvent.click(screen.getByRole('button', { name: 'Discover' }));

    expect(
      await screen.findByText('Please fill in all search fields.'),
    ).toBeInTheDocument();
  });

  it('allows keyboard focus on the Discover button', async () => {
    mockRestaurantsResponse([]);

    renderHomePage();

    screen.getByRole('combobox', { name: 'Guests' }).focus();
    await userEvent.tab();

    expect(screen.getByRole('button', { name: 'Discover' })).toHaveFocus();
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
