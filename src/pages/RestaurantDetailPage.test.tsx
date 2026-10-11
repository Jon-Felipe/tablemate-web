import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getRestaurantById, RestaurantNotFoundError } from '../api/restaurants';
import type { Restaurant } from '../types/restaurant';
import RestaurantDetailPage from './RestaurantDetailPage';

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

function renderRestaurantDetailPage(id = 'restaurant-1') {
  return render(
    <MemoryRouter initialEntries={[`/restaurants/${id}`]}>
      <Routes>
        <Route path='/restaurants/:id' element={<RestaurantDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RestaurantDetailPage', () => {
  beforeEach(() => {
    vi.mocked(getRestaurantById).mockReset();
  });

  it('should show loading state while the restaurant is being fetched', () => {
    vi.mocked(getRestaurantById).mockReturnValue(new Promise(() => {}));

    renderRestaurantDetailPage();

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading restaurant...',
    );
  });

  it('should render restaurant details when loading succeeds', async () => {
    vi.mocked(getRestaurantById).mockResolvedValue(restaurant);

    renderRestaurantDetailPage();

    expect(
      await screen.findByRole('heading', { name: 'The Golden Fork' }),
    ).toBeInTheDocument();
    expect(screen.getByText('European')).toBeInTheDocument();
    expect(
      screen.getByText('12 Main Street, Johannesburg'),
    ).toBeInTheDocument();
    expect(screen.getByText('4.7')).toBeInTheDocument();
    expect(getRestaurantById).toHaveBeenCalledWith('restaurant-1');
  });

  it('should show a not-found state when the restaurant does not exist', async () => {
    vi.mocked(getRestaurantById).mockRejectedValue(
      new RestaurantNotFoundError(),
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
    vi.mocked(getRestaurantById).mockRejectedValue(
      new Error('Network failure'),
    );

    renderRestaurantDetailPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to load this restaurant. Please try again.',
    );
  });

  it('should provide a link back to the restaurant listing', async () => {
    vi.mocked(getRestaurantById).mockReturnValue(new Promise(() => {}));

    renderRestaurantDetailPage();

    expect(
      screen.getByRole('link', { name: /Back to restaurants/ }),
    ).toHaveAttribute('href', '/');
  });
});
