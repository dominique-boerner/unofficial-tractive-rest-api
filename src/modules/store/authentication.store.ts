import { Injectable } from '@nestjs/common';
import { TractiveAuth } from '../../interfaces/tractive-auth.interface';
import { NotAuthenticatedException } from '../../exceptions/NotAuthenticated.exception';

/**
 * Store for saving the authentication.
 */
@Injectable()
export class AuthenticationStore {
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
}
