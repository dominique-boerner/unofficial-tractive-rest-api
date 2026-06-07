import { Injectable } from '@nestjs/common';
import { TractiveAuth } from '../../interfaces/tractive-auth.interface';
import { NotAuthenticatedException } from '../../exceptions/NotAuthenticated.exception';

/**
 * Store for saving the authentication.
 */
@Injectable()
export class AuthenticationStore {
  /**
   * Safety margin (in seconds) before the actual expiry at which we already
   * treat the cached token as expired, so we never use a token that would
   * expire while a request is still in flight.
   */
  private static readonly EXPIRY_BUFFER_SECONDS = 60;

  private _lastAuthenticationCache: TractiveAuth = null;

  get lastAuthenticationCache(): TractiveAuth {
    return this._lastAuthenticationCache;
  }

  set lastAuthenticationCache(value: TractiveAuth) {
    this._lastAuthenticationCache = value;
  }

  get accessToken(): string {
    try {
      return this._lastAuthenticationCache.access_token;
    } catch (e) {
      throw new NotAuthenticatedException();
    }
  }

  /**
   * Returns true if there is a cached authentication whose token has not
   * expired yet. Tractive returns `expires_at` as a unix timestamp in seconds.
   */
  get hasValidAuthentication(): boolean {
    if (!this._lastAuthenticationCache) {
      return false;
    }
    const nowInSeconds = Math.floor(Date.now() / 1000);
    return (
      this._lastAuthenticationCache.expires_at -
        AuthenticationStore.EXPIRY_BUFFER_SECONDS >
      nowInSeconds
    );
  }
}
