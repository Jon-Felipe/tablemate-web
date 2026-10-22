import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// extras
import type { RootState } from '../../app/store';
import { restaurantApi } from '../../services/restaurantApi';
import { setCredentials, logout as clearAuth } from './authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const [loginRequest, loginResult] = restaurantApi.useLoginMutation();
  const [registerRequest, registerResult] = restaurantApi.useRegisterMutation();

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      const result = await loginRequest(credentials).unwrap();

      dispatch(
        setCredentials({ user: result.user, accessToken: result.accessToken }),
      );

      return result.user;
    },
    [dispatch, loginRequest],
  );

  const register = useCallback(
    async (details: { name: string; email: string; password: string }) => {
      return registerRequest(details).unwrap();
    },
    [registerRequest],
  );

  const logout = useCallback(() => {
    dispatch(clearAuth());
    dispatch(restaurantApi.util.resetApiState());
  }, [dispatch]);

  return {
    user,
    accessToken,
    isAuthenticated: Boolean(accessToken && user),
    login,
    register,
    logout,
    isLoggingIn: loginResult.isLoading,
    isRegistering: registerResult.isLoading,
  };
}
