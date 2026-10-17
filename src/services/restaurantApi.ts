import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { Restaurant } from '../types/restaurant';
import type { RestaurantMenu } from '../types/restaurantMenu';

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const restaurantApi = createApi({
  reducerPath: 'restaurantApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: (builder) => ({
    getRestaurants: builder.query<Restaurant[], void>({
      query: () => '/restaurants',
      transformResponse: (response: ApiResponse<Restaurant[]>) => response.data,
    }),
    getRestaurantById: builder.query<Restaurant, string>({
      query: (id) => `/restaurants/${id}`,
      transformResponse: (response: ApiResponse<Restaurant>) => response.data,
    }),
    getRestaurantMenu: builder.query<RestaurantMenu, string>({
      query: (id) => `/restaurants/${id}/menu`,
      transformResponse: (response: ApiResponse<RestaurantMenu>) =>
        response.data,
    }),
  }),
});

export const {
  useGetRestaurantsQuery,
  useGetRestaurantByIdQuery,
  useGetRestaurantMenuQuery,
} = restaurantApi;
