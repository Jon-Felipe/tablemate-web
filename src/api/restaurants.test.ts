import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getRestaurantById,
  getRestaurants,
  RestaurantNotFoundError,
} from './restaurants';

const restaurant = {
  id: 'restaurant-1',
  name: 'The Golden Fork',
  description: 'Modern European cuisine in a relaxed atmosphere.',
  cuisine: 'European',
  address: '12 Main Street',
  city: 'Johannesburg',
  rating: 4.7,
};

const apiResponse = (data: unknown) => ({
  statusCode: 200,
  message: 'Success',
  data,
});

describe('restaurant API', () => {
  const fetchMock = vi.fn();

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('should return restaurants from the API response envelope', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(apiResponse([restaurant])), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(getRestaurants()).resolves.toEqual([restaurant]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/restaurants$/),
    );
  });

  it('should throws when the restaurant listing request fails', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getRestaurants()).rejects.toThrow(
      'Failed to fetch restaurants',
    );
  });

  it('should return restaurant from the detail response envelope', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(apiResponse(restaurant)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(getRestaurantById('restaurant-1')).resolves.toEqual(
      restaurant,
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/restaurants\/restaurant-1$/),
    );
  });

  it('should URL-encode the restaurant ID', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(apiResponse(restaurant)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await getRestaurantById('restaurant/1');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/restaurants\/restaurant%2F1$/),
    );
  });

  it('should throw RestaurantNotFoundError for HTTP 404', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getRestaurantById('missing')).rejects.toBeInstanceOf(
      RestaurantNotFoundError,
    );
  });

  it('should throw a generic error for other detail request failures', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getRestaurantById('restaurant-1')).rejects.toThrow(
      'Failed to fetch restaurant',
    );
  });
});
