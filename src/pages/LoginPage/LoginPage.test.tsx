import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from '../../features/auth/useAuth';
import LoginPage from './LoginPage';

vi.mock('../../features/auth/useAuth', () => ({
  useAuth: vi.fn(),
}));

const testUser = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'CUSTOMER' as const,
};

const mockLogin = vi.fn(async () => testUser);

function LocationDisplay() {
  const location = useLocation();
  return <output data-testid='current-path'>{location.pathname}</output>;
}

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<h1>Register page</h1>} />
        <Route path='/' element={<h1>Home page</h1>} />
      </Routes>
      <LocationDisplay />
    </MemoryRouter>,
  );
}

async function fillLoginForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(
    screen.getByPlaceholderText('Connoisseur email address'),
    'john@example.com',
  );
  await user.type(screen.getByPlaceholderText('Password'), 'secure-password-123');
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      isLoggingIn: false,
      isRegistering: false,
    });
    mockLogin.mockClear();
  });

  it('renders the login form and account links', () => {
    renderLoginPage();

    expect(
      screen.getByRole('heading', { name: 'Return to Your Table' }),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Connoisseur email address'),
    ).toHaveAttribute('type', 'email');
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute(
      'type',
      'password',
    );
    expect(screen.getByLabelText('Remember for 30 days')).toBeChecked();
    expect(
      screen.getByRole('link', { name: /Create an account/ }),
    ).toHaveAttribute('href', '/register');
    expect(
      screen.getByRole('button', { name: /Sign In to TableMate/ }),
    ).toBeEnabled();
  });

  it('submits the credentials and navigates home after a successful login', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await fillLoginForm(user);
    await user.click(screen.getByRole('button', { name: /Sign In to TableMate/ }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'secure-password-123',
      });
    });
    expect(await screen.findByRole('heading', { name: 'Home page' }))
      .toBeInTheDocument();
    expect(screen.getByTestId('current-path')).toHaveTextContent('/');
  });

  it('asks for both credentials when either is missing', async () => {
    const user = userEvent.setup();
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderLoginPage();

    await user.click(screen.getByRole('button', { name: /Sign In to TableMate/ }));

    expect(alert).toHaveBeenCalledWith(
      'Please enter both email and password.',
    );
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('rejects passwords shorter than 12 characters without logging in', async () => {
    const user = userEvent.setup();
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderLoginPage();

    await user.type(
      screen.getByPlaceholderText('Connoisseur email address'),
      'john@example.com',
    );
    await user.type(screen.getByPlaceholderText('Password'), 'short');
    await user.click(screen.getByRole('button', { name: /Sign In to TableMate/ }));

    expect(alert).toHaveBeenCalledWith(
      'Password must be at least 12 characters long.',
    );
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows the server message when login fails', async () => {
    const user = userEvent.setup();
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    mockLogin.mockRejectedValueOnce({
      data: { message: 'Invalid credentials' },
    });
    renderLoginPage();

    await fillLoginForm(user);
    await user.click(screen.getByRole('button', { name: /Sign In to TableMate/ }));

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith('Invalid credentials');
    });
  });

  it('disables the submit button while login is pending', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      isLoggingIn: true,
      isRegistering: false,
    });
    renderLoginPage();

    expect(
      screen.getByRole('button', { name: /Signing In/ }),
    ).toBeDisabled();
  });
});
