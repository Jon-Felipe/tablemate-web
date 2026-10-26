import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import ProfilePage from './ProfilePage';
import authReducer, { setCredentials } from '../features/auth/authSlice';
import { restaurantApi } from '../services/restaurantApi';
import type { AuthUser } from '../types/auth';

const mockUser: AuthUser = {
  id: 'test-user-id',
  name: 'Test Tester',
  email: 'test@test.com',
  role: 'CUSTOMER',
};

function createTestStore(accessToken: string | null = 'test-access-token') {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      [restaurantApi.reducerPath]: restaurantApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(restaurantApi.middleware),
  });

  if (accessToken) {
    store.dispatch(setCredentials({ user: mockUser, accessToken }));
  }

  return store;
}

function renderProfilePage(accessToken: string | null = 'test-access-token') {
  const store = createTestStore(accessToken);

  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      </Provider>,
    ),
  };
}

function mockFetchResponse(data: AuthUser | null, status = 200) {
  return vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        statusCode: status,
        message: status === 200 ? 'Success' : 'Request failed',
        data,
      }),
      {
        status,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ),
  );
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3000');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('should show a loading state while the profile is being fetched', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise<Response>(() => {})),
    );

    renderProfilePage();

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading your profile...',
    );
  });

  it('should display the authenticated user details', async () => {
    vi.stubGlobal('fetch', mockFetchResponse(mockUser));

    renderProfilePage();

    expect(await screen.findByText('Test Tester')).toBeInTheDocument();
    expect(screen.getByText('test@test.com')).toBeInTheDocument();
    expect(screen.getByText('CUSTOMER')).toBeInTheDocument();
    expect(screen.queryByText('test-user-id')).not.toBeInTheDocument();
  });

  it('should send the access token when requesting the current user', async () => {
    const fetchMock = mockFetchResponse(mockUser);

    vi.stubGlobal('fetch', fetchMock);

    renderProfilePage('test-access-token');

    expect(await screen.findByText('Test Tester')).toBeInTheDocument();

    await waitFor(() => {
      const request = fetchMock.mock.calls.find(([input]) => {
        const url = input instanceof Request ? input.url : String(input);
        return url.includes('/users/me');
      });

      expect(request).toBeDefined();

      const input = request?.[0];
      const init = request?.[1];

      const headers =
        input instanceof Request
          ? new Headers(input.headers)
          : new Headers(init?.headers);

      expect(headers.get('Authorization')).toBe('Bearer test-access-token');
    });
  });

  it('should show an error message when the profile request fails', async () => {
    vi.stubGlobal('fetch', mockFetchResponse(null, 500));

    renderProfilePage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "We couldn't load your profile. Please try again.",
    );
    expect(
      screen.getByRole('button', { name: 'Try again' }),
    ).toBeInTheDocument();
  });

  it('should retry the profile request when Try again is clicked', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            statusCode: 500,
            message: 'Server error',
            data: null,
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            statusCode: 200,
            message: 'Success',
            data: mockUser,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );

    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();

    renderProfilePage();

    await user.click(await screen.findByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Test Tester')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should show an expired-session message when the API returns 401', async () => {
    vi.stubGlobal('fetch', mockFetchResponse(null, 401));

    renderProfilePage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your session has expired or is no longer valid.',
    );
    expect(
      screen.queryByRole('button', { name: 'Try again' }),
    ).not.toBeInTheDocument();
  });

  it('should clear authentication when Log out is clicked', async () => {
    vi.stubGlobal('fetch', mockFetchResponse(mockUser));

    const user = userEvent.setup();
    const { store } = renderProfilePage();

    await screen.findByText('Test Tester');

    await user.click(await screen.findByRole('button', { name: 'Log out' }));

    await waitFor(() => {
      expect(store.getState().auth.user).toBeNull();
      expect(store.getState().auth.accessToken).toBeNull();
    });
  });

  it('should clear authentication when logging out from an expired session', async () => {
    vi.stubGlobal('fetch', mockFetchResponse(null, 401));

    const user = userEvent.setup();
    const { store } = renderProfilePage();

    await user.click(await screen.findByRole('button', { name: 'Log out' }));

    await waitFor(() => {
      expect(store.getState().auth.user).toBeNull();
      expect(store.getState().auth.accessToken).toBeNull();
    });
  });

  it('should show a message when no access token is available', () => {
    const fetchMock = vi.fn();

    vi.stubGlobal('fetch', fetchMock);

    renderProfilePage(null);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'You need to log in to view your profile.',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
