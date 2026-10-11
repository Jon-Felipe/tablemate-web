import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getRestaurantById, getRestaurants } from './api/restaurants';
import type { Restaurant } from './types/restaurant';
import App from './App';

vi.mock('./api/restaurants', () => ({
  getRestaurants: vi.fn(),
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

describe('App navigation', () => {
  beforeEach(() => {
    vi.mocked(getRestaurants).mockReset();
    vi.mocked(getRestaurantById).mockReset();
  });

  it('should navigate from the restaurant listing to its details and back', async () => {
    const user = userEvent.setup();

    vi.mocked(getRestaurants).mockResolvedValue([restaurant]);
    vi.mocked(getRestaurantById).mockResolvedValue(restaurant);

    render(<App />);

    const restaurantLink = await screen.findByRole('link', {
      name: /The Golden Fork/,
    });

    expect(restaurantLink).toHaveAttribute('href', '/restaurants/restaurant-1');

    await user.click(restaurantLink);

    expect(
      await screen.findByRole('heading', { name: 'The Golden Fork' }),
    ).toBeInTheDocument();
    expect(getRestaurantById).toHaveBeenCalledWith('restaurant-1');

    await user.click(
      screen.getByRole('link', { name: '← Back to restaurants' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Explore restaurants' }),
    ).toBeInTheDocument();
  });
});
