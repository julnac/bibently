import { authService } from './authService';

/**
 * Inicjalizuje mock token dla developmentu
 * UWAGA: To tylko do testów! W produkcji użyć prawdziwego logowania
 */
export async function initMockAuthForDev() {
  // Real Bearer token from your backend
  const mockToken = 'Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJhdWQiOiJsb2NhbC1wcm9qZWN0LWlkIiwiYXV0aF90aW1lIjoxNzY4MTU1MTMxLCJlbWFpbCI6ImFkbWluQGxvY2FsaG9zdC5jb20iLCJleHAiOjE3NjgxNTg3MzEsImlhdCI6MTc2ODE1NTEzMSwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2xvY2FsLXByb2plY3QtaWQiLCJzdWIiOiJhZG1pbl91c2VyX3h5el8xMjNfc2VjcmV0X2lkIiwidXNlcl9pZCI6ImFkbWluX3VzZXJfeHl6XzEyM19zZWNyZXRfaWQifQ.';

  // Force update token every time in dev mode
  await authService.setToken(mockToken);
  console.log('[DEV] Mock auth token initialized:', mockToken.substring(0, 30) + '...');
}
