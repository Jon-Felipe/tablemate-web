import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getRestaurants } from '../api/restaurants';
import type { Restaurant } from '../types/restaurant';
import HomePage from './HomePage';

vi.mock('../api/restaurants', () => ({
  getRestaurants: vi.fn(),
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

function renderHomePage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.mocked(getRestaurants).mockReset();
  });

  it('should show loading state while restaurants are being fetched', () => {
    vi.mocked(getRestaurants).mockReturnValue(new Promise(() => {}));

    renderHomePage();

    expect(screen.getByRole('status')).toHaveTextContent('Loading restaurants');
  });

  it('should render restaurant cards when loading succeeds', async () => {
    vi.mocked(getRestaurants).mockResolvedValue([restaurant]);

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
    vi.mocked(getRestaurants).mockResolvedValue([]);

    renderHomePage();

    expect(
      await screen.findByRole('heading', { name: 'No restaurants yet' }),
    ).toBeInTheDocument();
  });

  it('should show an error message when loading fails', async () => {
    vi.mocked(getRestaurants).mockRejectedValue(new Error('Network failure'));

    renderHomePage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to load restaurants. Please try again.',
    );
  });

  it('should link each restaurant card to its detail page', async () => {
    vi.mocked(getRestaurants).mockResolvedValue([restaurant]);

    renderHomePage();

    const cardLink = await screen.findByRole('link', {
      name: /The Golden Fork/,
    });

    expect(cardLink).toHaveAttribute('href', '/restaurants/restaurant-1');
  });
});
