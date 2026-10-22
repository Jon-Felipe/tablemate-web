import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

// extras
import LoginPage from './LoginPage';
import authReducer from '../features/auth/authSlice';
import { restaurantApi } from '../services/restaurantApi';

const testUser = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'CUSTOMER' as const,
};

const accessToken = 'test-access-token';

const successResponse = () =>
  new Response(
    JSON.stringify({
      statusCode: 200,
      message: 'Login successful',
      data: {
        user: testUser,
        accessToken,
      },
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  );

const errorResponse = () =>
  new Response(
    JSON.stringify({
      statusCode: 401,
      message: 'Invalid credentials',
      data: null,
    }),
    {
      status: 401,
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

function renderLoginPage() {
  const store = createTestStore();

  const view = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/login`]}>
        <Routes>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<h1>Register page</h1>} />
          <Route path='/' element={<h1>Home page</h1>} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    </Provider>,
  );

  return { store, ...view };
}

async function fillLoginForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Email address'), 'john@example.com');
  await user.type(screen.getByLabelText('Password'), 'secure-password-123');
}

function mockSuccessfulLogin() {
  const fetchMock = vi.fn(
    async (_input: RequestInfo | URL, _init?: RequestInit) => successResponse(),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('LoginPage', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('should render the login form with required fields', () => {
    renderLoginPage();

    expect(
      screen.getByRole('heading', { name: 'Log in to TableMate' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeRequired();
    expect(screen.getByLabelText('Password')).toBeRequired();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeEnabled();
    expect(
      screen.getByRole('link', { name: 'Create an account' }),
    ).toHaveAttribute('href', '/register');
  });

  it('should send the correct POST request and trims the email', async () => {
    const user = userEvent.setup();
    const fetchMock = mockSuccessfulLogin();

    renderLoginPage();

    await user.type(
      screen.getByLabelText('Email address'),
      '   john@example.com    ',
    );
    await user.type(screen.getByLabelText('Password'), 'secure-password-123');

    await user.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const [requestInput] = fetchMock.mock.calls[0];

    expect(requestInput).toBeInstanceOf(Request);

    const request = requestInput as Request;

    expect(new URL(request.url).pathname).toBe('/api/v1/users/login');
    expect(request.method).toBe('POST');
    expect(await request.clone().json()).toEqual({
      email: 'john@example.com',
      password: 'secure-password-123',
    });
  });

  it('should store the user and access token in Redux after successful login', async () => {
    const user = userEvent.setup();
    const { store } = renderLoginPage();

    mockSuccessfulLogin();

    await fillLoginForm(user);
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(
      await screen.findByRole('heading', { name: 'Home page' }),
    ).toBeInTheDocument();
    expect(store.getState().auth).toEqual({ user: testUser, accessToken });
  });

  it('should navigate to the home page after successul login', async () => {
    const user = userEvent.setup();

    renderLoginPage();
    mockSuccessfulLogin();

    await fillLoginForm(user);
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(
      await screen.findByRole('heading', { name: 'Home page' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('current-path')).toHaveTextContent('/');
  });

  it('should show an accessible error when the server rejects login fails', async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => errorResponse()),
    );

    renderLoginPage();

    await fillLoginForm(user);
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to log in. Check your credentials and try again.',
    );
    expect(screen.getByRole('button', { name: 'Log in' })).toBeEnabled();
  });

  it('should show an accessible error when the network request fails', async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }),
    );

    const { store } = renderLoginPage();

    await fillLoginForm(user);
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to log in. Check your credentials and try again.',
    );
    expect(store.getState().auth).toEqual({ user: null, accessToken: null });
  });

  it('should disable the submit button while Login is pending', async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise<Response>(() => {})),
    );

    renderLoginPage();

    await fillLoginForm(user);
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(
      await screen.findByRole('button', { name: 'Logging in...' }),
    ).toBeDisabled();
  });

  it('should allow retrying after failed Login', async () => {
    const user = userEvent.setup();
    let requestCount = 0;

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        requestCount += 1;

        return requestCount === 1 ? errorResponse() : successResponse();
      }),
    );

    const { store } = renderLoginPage();

    await fillLoginForm(user);
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to log in. Check your credentials and try again.',
    );
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(
      screen.getByRole('heading', { name: 'Home page' }),
    ).toBeInTheDocument();
    expect(requestCount).toBe(2);
    expect(store.getState().auth).toEqual({ user: testUser, accessToken });
  });
});
