import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

// extras
import RegisterPage from './RegisterPage';
import { restaurantApi } from '../services/restaurantApi';

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
      auth: (state = { user: null, accessToken: null }) => state,
      [restaurantApi.reducerPath]: restaurantApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(restaurantApi.middleware),
  });
}

function renderRegisterPage() {
  const store = createTestStore();

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/register`]}>
        <Routes>
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/login' element={<h1>Login page</h1>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

async function fillRegistrationForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Full name'), 'John Doe');
  await user.type(screen.getByLabelText('Email address'), 'john@example.com');
  await user.type(screen.getByLabelText('Password'), 'secure-password-123');
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
    vi.unstubAllGlobals();
  });

  it('should render the registration form with required fields', () => {
    renderRegisterPage();

    expect(
      screen.getByRole('heading', { name: 'Create your account' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toBeRequired();
    expect(screen.getByLabelText('Email address')).toBeRequired();
    expect(screen.getByLabelText('Password')).toBeRequired();
    expect(
      screen.getByRole('button', { name: 'Create account' }),
    ).toBeEnabled();
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute(
      'href',
      '/login',
    );
  });

  it('should submit the correct payload to POST /users', async () => {
    const user = userEvent.setup();
    const fetchMock = mockSuccessfulRegistration();

    renderRegisterPage();

    await fillRegistrationForm(user);

    const nameInput = screen.getByLabelText('Full name');
    const emailInput = screen.getByLabelText('Email address');

    await user.clear(nameInput);
    await user.type(nameInput, '    John Doe    ');

    await user.clear(emailInput);
    await user.type(emailInput, '   john@example.com    ');

    await user.clear(emailInput);
    await user.type(emailInput, 'john@example.com');

    await user.click(screen.getByRole('button', { name: 'Create account' }));

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

  it('should show the confirmation and login link after successful registration', async () => {
    const user = userEvent.setup();
    mockSuccessfulRegistration();

    renderRegisterPage();

    await fillRegistrationForm(user);
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(
      await screen.findByRole('heading', { name: 'Account created!' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/account has been created successfully/i));
    expect(
      screen.getByRole('link', { name: 'Log in to your account' }),
    ).toHaveAttribute('href', '/login');
  });

  it('should show an accessible error when registration fails', async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => errorResponse()),
    );

    renderRegisterPage();

    await fillRegistrationForm(user);
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to create your account. Please check your details and try again.',
    );
    expect(
      screen.getByRole('button', { name: 'Create account' }),
    ).toBeEnabled();
  });

  it('should disable the submit button while registration is pending', async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise<Response>(() => {})),
    );

    renderRegisterPage();

    await fillRegistrationForm(user);
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(
      await screen.findByRole('button', { name: 'Creating account...' }),
    ).toBeDisabled();
  });

  it('should allow retrying after failed registration', async () => {
    const user = userEvent.setup();
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
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(
      screen.getByRole('heading', { name: 'Account created!' }),
    ).toBeInTheDocument();
    expect(requestCount).toBe(2);
  });
});
