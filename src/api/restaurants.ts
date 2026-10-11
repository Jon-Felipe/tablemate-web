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
