import type { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

// extras
import authReducer, { setCredentials } from '../../features/auth/authSlice';
import { restaurantApi } from '../../services/restaurantApi';
import { useAuth } from './useAuth';
import type { AuthUser } from '../../types/auth';

const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'CUSTOMER' as const,
};

const mockCredentials = {
  email: 'test@example.com',
  password: 'Password123!',
};

const mockRegistration = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'Password123!',
};

const mockAccessToken = 'test-access-token';

function createTestStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      [restaurantApi.reducerPath]: restaurantApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(restaurantApi.middleware),
  });
}

function createWrapper() {
  const store = createTestStore();

  function Wrapper({ children }: PropsWithChildren) {
    return <Provider store={store}>{children}</Provider>;
  }

  return { Wrapper, store };
}

function mockFetchResponse(body: unknown, status = 200) {
  return vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

function apiSuccess<T>(data: T, statusCode = 200) {
  return {
    statusCode,
    message: 'Success',
    data,
  };
}

function apiError(statusCode: number, message: string) {
  return {
    statusCode,
    message,
    data: null,
  };
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetchResponse({}));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should return an unauthenticated initial state', () => {
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useAuth(), {
      wrapper: Wrapper,
    });

    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoggingIn).toBe(false);
    expect(result.current.isRegistering).toBe(false);
  });

  it('should log in and stores the user and access token in Redux', async () => {
    const accessToken = 'test-accesss-token';

    vi.stubGlobal(
      'fetch',
      mockFetchResponse(apiSuccess({ user: mockUser, accessToken })),
    );

    const { Wrapper, store } = createWrapper();

    const { result } = renderHook(() => useAuth(), {
      wrapper: Wrapper,
    });

    let returnedUser: AuthUser | undefined;

    await act(async () => {
      returnedUser = await result.current.login(mockCredentials);
    });

    expect(returnedUser).toEqual(mockUser);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.accessToken).toBe(accessToken);
    expect(result.current.isAuthenticated).toBe(true);

    expect(store.getState().auth).toMatchObject({
      user: mockUser,
      accessToken,
    });
  });

  it('should reject when login fails and leaves authentication state unchanges', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetchResponse(apiError(401, 'Invalid credentials'), 401),
    );

    const { Wrapper, store } = createWrapper();

    const { result } = renderHook(() => useAuth(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await expect(result.current.login(mockCredentials)).rejects.toBeDefined();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);

    expect(store.getState().auth).toMatchObject({
      user: null,
      accessToken: null,
    });
  });

  it('should register a user and returns the API response without authenticating them', async () => {
    const registrationResponse = {
      id: 'user-2',
      name: mockRegistration.name,
      email: mockRegistration.email,
    };

    vi.stubGlobal(
      'fetch',
      mockFetchResponse(apiSuccess(registrationResponse, 201), 201),
    );

    const { Wrapper, store } = createWrapper();

    const { result } = renderHook(() => useAuth(), {
      wrapper: Wrapper,
    });

    let response: unknown;

    await act(async () => {
      response = await result.current.register(mockRegistration);
    });

    expect(response).toEqual(registrationResponse);
    expect(result.current.isAuthenticated).toBe(false);
    expect(store.getState().auth.user).toBeNull();
    expect(store.getState().auth.accessToken).toBeNull();
  });

  it('should reject when registration fails', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetchResponse(apiError(409, 'Email already exists'), 409),
    );

    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useAuth(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await expect(
        result.current.register(mockRegistration),
      ).rejects.toBeDefined();
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should set isLoggingIn while the login request is pending', async () => {
    let resolveResponse!: (response: Response) => void;

    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveResponse = resolve;
          }),
      ),
    );

    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useAuth(), {
      wrapper: Wrapper,
    });

    let loginPromise!: Promise<unknown>;

    act(() => {
      loginPromise = result.current.login(mockCredentials);
    });

    await waitFor(() => {
      expect(result.current.isLoggingIn).toBe(true);
    });

    await act(async () => {
      resolveResponse(
        new Response(
          JSON.stringify(
            apiSuccess({
              user: mockUser,
              accessToken: mockAccessToken,
            }),
          ),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );

      await loginPromise;
    });

    expect(result.current.isLoggingIn).toBe(false);
  });

  it('should set isRegistering while the registration request is pending', async () => {
    let resolveResponse!: (response: Response) => void;

    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveResponse = resolve;
          }),
      ),
    );

    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useAuth(), {
      wrapper: Wrapper,
    });

    let registerPromise!: Promise<unknown>;

    act(() => {
      registerPromise = result.current.register(mockRegistration);
    });

    await waitFor(() => {
      expect(result.current.isRegistering).toBe(true);
    });

    await act(async () => {
      resolveResponse(
        new Response(
          JSON.stringify(
            apiSuccess(
              {
                id: 'user-2',
                name: mockRegistration.name,
                email: mockRegistration.email,
              },
              201,
            ),
          ),
          {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );

      await registerPromise;
    });

    await waitFor(() => {
      expect(result.current.isRegistering).toBe(false);
    });
  });

  it('should log out and clears authentication state', () => {
    const { Wrapper, store } = createWrapper();

    const { result } = renderHook(() => useAuth(), {
      wrapper: Wrapper,
    });

    act(() => {
      store.dispatch(
        setCredentials({ user: mockUser, accessToken: mockAccessToken }),
      );
    });

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should reset RTK Query API state on logout', async () => {
    const { Wrapper, store } = createWrapper();

    const { result } = renderHook(() => useAuth(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await store.dispatch(
        restaurantApi.util.upsertQueryData('getRestaurants', undefined, []),
      );
    });

    expect(
      Object.keys(store.getState()[restaurantApi.reducerPath].queries),
    ).toHaveLength(1);

    act(() => {
      result.current.logout();
    });

    expect(store.getState()[restaurantApi.reducerPath].queries).toEqual({});

    expect(store.getState()[restaurantApi.reducerPath].mutations).toEqual({});
  });
});
