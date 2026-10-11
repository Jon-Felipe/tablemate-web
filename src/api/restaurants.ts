import type { Restaurant } from '../types/restaurant';

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getRestaurants(): Promise<Restaurant[]> {
  const response = await fetch(`${API_BASE_URL}/restaurants`);

  if (!response.ok) throw new Error('Failed to fetch restaurants');

  const result: ApiResponse<Restaurant[]> = await response.json();

  return result.data;
}

export async function getRestaurantById(id: string): Promise<Restaurant> {
  const response = await fetch(
    `${API_BASE_URL}/restaurants/${encodeURIComponent(id)}`,
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new RestaurantNotFoundError();
    }
    throw new Error('Failed to fetch restaurant');
  }

  const result: ApiResponse<Restaurant> = await response.json();

  return result.data;
}

export class RestaurantNotFoundError extends Error {
  constructor() {
    super('Restaurant not found');
    this.name = 'RestaurantNotFoundError';
  }
}
