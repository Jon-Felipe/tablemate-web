import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

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
  await user.type(screen.getByLabelText('FULL NAME'), 'John Doe');
  await user.type(screen.getByLabelText('EMAIL ADDRESS'), 'john@example.com');
  await user.type(
    screen.getByLabelText('PASSWORD'),
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
      screen.getByRole('heading', { name: 'Create Your Account' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('FULL NAME')).toBeRequired();
    expect(screen.getByLabelText('EMAIL ADDRESS')).toBeRequired();
    expect(screen.getByLabelText('PASSWORD')).toBeRequired();
    expect(
      screen.getByRole('button', { name: /Create Account/ }),
    ).toBeEnabled();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/login',
    );
  });

  it('submits the trimmed name and credentials to POST /users', async () => {
    const user = userEvent.setup();
    const fetchMock = mockSuccessfulRegistration();

    renderRegisterPage();

    await user.type(screen.getByLabelText('FULL NAME'), '  John Doe  ');
    await user.type(screen.getByLabelText('EMAIL ADDRESS'), 'john@example.com');
    await user.type(
      screen.getByLabelText('PASSWORD'),
      'secure-password-123',
    );
    await user.click(screen.getByRole('button', { name: /Create Account/ }));

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
    await user.click(screen.getByRole('button', { name: /Create Account/ }));

    expect(await screen.findByRole('heading', { name: 'Login page' }))
      .toBeInTheDocument();
    expect(screen.getByTestId('current-path')).toHaveTextContent('/login');
  });

  it('shows the server error when registration fails', async () => {
    const user = userEvent.setup();
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn(async () => errorResponse()));

    renderRegisterPage();

    await fillRegistrationForm(user);
    await user.click(screen.getByRole('button', { name: /Create Account/ }));

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith('Internal Server Error');
    });
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Create Account/ }),
      ).toBeEnabled();
    });
  });

  it('rejects passwords shorter than 12 characters without making a request', async () => {
    const user = userEvent.setup();
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const fetchMock = mockSuccessfulRegistration();

    renderRegisterPage();

    await user.type(screen.getByLabelText('FULL NAME'), 'John Doe');
    await user.type(screen.getByLabelText('EMAIL ADDRESS'), 'john@example.com');
    await user.type(screen.getByLabelText('PASSWORD'), 'short');
    await user.click(screen.getByRole('button', { name: /Create Account/ }));

    expect(alert).toHaveBeenCalledWith(
      'Password must be at least 12 characters long.',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('disables the submit button while registration is pending', async () => {
    const user = userEvent.setup();

    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})));

    renderRegisterPage();

    await fillRegistrationForm(user);
    await user.click(screen.getByRole('button', { name: /Create Account/ }));

    expect(
      await screen.findByRole('button', { name: /Creating Account/ }),
    ).toBeDisabled();
  });

  it('allows retrying after a failed registration', async () => {
    const user = userEvent.setup();
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
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
    await user.click(screen.getByRole('button', { name: /Create Account/ }));

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith('Internal Server Error');
    });
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Create Account/ }),
      ).toBeEnabled();
    });
    await user.click(screen.getByRole('button', { name: /Create Account/ }));

    expect(await screen.findByRole('heading', { name: 'Login page' }))
      .toBeInTheDocument();
    expect(requestCount).toBe(2);
  });
});
