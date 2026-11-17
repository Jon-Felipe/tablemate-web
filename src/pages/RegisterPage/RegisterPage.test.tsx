import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { toast } from 'react-toastify';

import authReducer from '../../features/auth/authSlice';
import { restaurantApi } from '../../services/restaurantApi';
import RegisterPage from './RegisterPage';

const registeredUser = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
};

const successResponse = () =>
  new Response(
    JSON.stringify({
      statusCode: 201,
      message: 'User created successfully',
      data: registeredUser,
    }),
    {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    },
  );

const errorResponse = () =>
  new Response(
    JSON.stringify({
      statusCode: 500,
      message: 'Internal Server Error',
      data: null,
    }),
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    },
  );

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

function LocationDisplay() {
  const location = useLocation();
  return <output data-testid='current-path'>{location.pathname}</output>;
}

function renderRegisterPage() {
  const store = createTestStore();

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/login' element={<h1>Login page</h1>} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    </Provider>,
  );
}

async function fillRegistrationForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText('e.g., John Doe'), 'John Doe');
  await user.type(screen.getByPlaceholderText('john@example.com'), 'john@example.com');
  await user.type(
    screen.getByPlaceholderText('Minimum 12 characters'),
    'secure-password-123',
  );
  await user.type(
    screen.getByPlaceholderText('Re-enter your password'),
    'secure-password-123',
  );
}

function mockSuccessfulRegistration() {
  const fetchMock = vi.fn(
    async (_input: RequestInfo | URL, _init?: RequestInit) => successResponse(),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('RegisterPage', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders the registration form with required fields and a sign-in link', () => {
    renderRegisterPage();

    expect(
      screen.getByRole('heading', { name: 'Create your account.' }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('john@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Minimum 12 characters')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Create account/ }),
    ).toBeEnabled();
    expect(screen.getByRole('link', { name: /Sign in instead/ })).toHaveAttribute(
      'href',
      '/login',
    );
  });

  it('submits the trimmed name and credentials to POST /users', async () => {
    const user = userEvent.setup();
    const fetchMock = mockSuccessfulRegistration();

    renderRegisterPage();

    await user.type(screen.getByPlaceholderText('e.g., John Doe'), '  John Doe  ');
    await user.type(screen.getByPlaceholderText('john@example.com'), 'john@example.com');
    await user.type(
      screen.getByPlaceholderText('Minimum 12 characters'),
      'secure-password-123',
    );
    await user.type(
      screen.getByPlaceholderText('Re-enter your password'),
      'secure-password-123',
    );
    await user.click(screen.getByRole('button', { name: /Create account/ }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const [requestInput] = fetchMock.mock.calls[0];
    expect(requestInput).toBeInstanceOf(Request);

    const request = requestInput as Request;
    expect(new URL(request.url).pathname).toBe('/api/v1/users');
    expect(request.method).toBe('POST');
    expect(await request.clone().json()).toEqual({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'secure-password-123',
    });
  });

  it('redirects to login after successful registration', async () => {
    const user = userEvent.setup();
    mockSuccessfulRegistration();

    renderRegisterPage();

    await fillRegistrationForm(user);
    await user.click(screen.getByRole('button', { name: /Create account/ }));

    expect(await screen.findByRole('heading', { name: 'Login page' }))
      .toBeInTheDocument();
    expect(screen.getByTestId('current-path')).toHaveTextContent('/login');
  });

  it('shows the server error when registration fails', async () => {
    const user = userEvent.setup();
    const toastError = vi.spyOn(toast, 'error').mockImplementation(() => 1);
    vi.stubGlobal('fetch', vi.fn(async () => errorResponse()));

    renderRegisterPage();

    await fillRegistrationForm(user);
    await user.click(screen.getByRole('button', { name: /Create account/ }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith('Internal Server Error');
    });
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Create account/ }),
      ).toBeEnabled();
    });
  });

  it('rejects passwords shorter than 12 characters without making a request', async () => {
    const user = userEvent.setup();
    const toastError = vi.spyOn(toast, 'error').mockImplementation(() => 1);
    const fetchMock = mockSuccessfulRegistration();

    renderRegisterPage();

    await user.type(screen.getByPlaceholderText('e.g., John Doe'), 'John Doe');
    await user.type(screen.getByPlaceholderText('john@example.com'), 'john@example.com');
    await user.type(screen.getByPlaceholderText('Minimum 12 characters'), 'short');
    await user.type(screen.getByPlaceholderText('Re-enter your password'), 'short');
    await user.click(screen.getByRole('button', { name: /Create account/ }));

    expect(toastError).toHaveBeenCalledWith(
      'Password must be at least 12 characters long.',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('disables the submit button while registration is pending', async () => {
    const user = userEvent.setup();

    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})));

    renderRegisterPage();

    await fillRegistrationForm(user);
    await user.click(screen.getByRole('button', { name: /Create account/ }));

    expect(
      await screen.findByRole('button', { name: /Creating account/ }),
    ).toBeDisabled();
  });

  it('allows retrying after a failed registration', async () => {
    const user = userEvent.setup();
    const toastError = vi.spyOn(toast, 'error').mockImplementation(() => 1);
    let requestCount = 0;

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        requestCount += 1;
        return requestCount === 1 ? errorResponse() : successResponse();
      }),
    );

    renderRegisterPage();

    await fillRegistrationForm(user);
    await user.click(screen.getByRole('button', { name: /Create account/ }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith('Internal Server Error');
    });
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Create account/ }),
      ).toBeEnabled();
    });
    await user.click(screen.getByRole('button', { name: /Create account/ }));

    expect(await screen.findByRole('heading', { name: 'Login page' }))
      .toBeInTheDocument();
    expect(requestCount).toBe(2);
  });
});
