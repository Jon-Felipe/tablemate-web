import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type {
  ApiResponse,
  RestaurantDetails,
  RestaurantListItem,
  RestaurantMenu,
} from '../types/restaurant';
import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const restaurantApi = createApi({
  reducerPath: 'restaurantApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: (builder) => ({
    getRestaurants: builder.query<RestaurantListItem[], void>({
      query: () => '/restaurants',
      transformResponse: (response: ApiResponse<RestaurantListItem[]>) =>
        response.data,
    }),
    getRestaurantById: builder.query<RestaurantDetails, string>({
      query: (id) => `/restaurants/${id}`,
      transformResponse: (response: ApiResponse<RestaurantDetails>) =>
        response.data,
    }),
    getRestaurantMenu: builder.query<RestaurantMenu, string>({
      query: (id) => `/restaurants/${id}/menu`,
      transformResponse: (response: ApiResponse<RestaurantMenu>) =>
        response.data,
    }),
    register: builder.mutation<AuthUser, RegisterRequest>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<AuthUser>) => response.data,
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: '/users/login',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<LoginResponse>) =>
        response.data,
    }),
    getCurrentUser: builder.query<AuthUser, string>({
      query: (accessToken) => ({
        url: '/users/me',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
      transformResponse: (response: ApiResponse<AuthUser>) => response.data,
    }),
  }),
});

export const {
  useGetRestaurantsQuery,
  useGetRestaurantByIdQuery,
  useGetRestaurantMenuQuery,
  useRegisterMutation,
  useLoginMutation,
  useGetCurrentUserQuery,
} = restaurantApi;
