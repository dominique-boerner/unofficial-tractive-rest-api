import { AuthenticationStore } from './authentication.store';
import { TractiveAuth } from '../../interfaces/tractive-auth.interface';
import { NotAuthenticatedException } from '../../exceptions/NotAuthenticated.exception';

describe('AuthenticationStore', () => {
  let store: AuthenticationStore;

  const nowInSeconds = () => Math.floor(Date.now() / 1000);

  const buildAuth = (expiresAt: number): TractiveAuth => ({
    user_id: 'user-1',
    client_id: 'client-1',
    expires_at: expiresAt,
    access_token: 'token-1',
  });

  beforeEach(() => {
    store = new AuthenticationStore();
  });

  describe('hasValidAuthentication', () => {
    it('returns false when nothing has been cached yet', () => {
      expect(store.hasValidAuthentication).toBe(false);
    });

    it('returns true for a token that expires well in the future', () => {
      store.lastAuthenticationCache = buildAuth(nowInSeconds() + 3600);
      expect(store.hasValidAuthentication).toBe(true);
    });

    it('returns false for a token that has already expired', () => {
      store.lastAuthenticationCache = buildAuth(nowInSeconds() - 3600);
      expect(store.hasValidAuthentication).toBe(false);
    });

    it('treats a token expiring within the safety buffer as expired', () => {
      // expires in 30s, which is inside the 60s safety buffer
      store.lastAuthenticationCache = buildAuth(nowInSeconds() + 30);
      expect(store.hasValidAuthentication).toBe(false);
    });
  });

  describe('accessToken', () => {
    it('returns the cached access token when authenticated', () => {
      store.lastAuthenticationCache = buildAuth(nowInSeconds() + 3600);
      expect(store.accessToken).toBe('token-1');
    });

    it('throws NotAuthenticatedException when nothing is cached', () => {
      expect(() => store.accessToken).toThrow(NotAuthenticatedException);
    });
  });
});
