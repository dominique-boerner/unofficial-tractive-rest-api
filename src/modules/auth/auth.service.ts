import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as process from 'process';
import { TractiveAuth } from '../../interfaces/tractive-auth.interface';
import { AuthenticationStore } from '../store/authentication.store';
import { TractiveApi } from '../../constants';

/**
 * Service for authentication the user against the tractive API.
 * The authentication uses the email and password of the user.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly authenticationStore: AuthenticationStore) {}

  /**
   * Authenticate the user against the tractive api, if
   * the user is not authenticated.
   */
  public async authenticate(): Promise<TractiveAuth> {
    const url = `${TractiveApi.BASE_URL}/auth/token`;
    const email = process.env.TRACTIVE_EMAIL;
    const password = process.env.TRACTIVE_PASSWORD;

    this.logger.log(`Authenticate Tractive user`);

    // Reuse the cached credentials only while the token is still valid.
    // Once it has expired we fall through and request a fresh token.
    if (this.authenticationStore.hasValidAuthentication) {
      this.logger.log(
        `User is already authenticated. Return last authenticated credentials`,
      );
      return this.authenticationStore.lastAuthenticationCache;
    }

    try {
      const response = await axios.post(url, null, {
        params: {
          platform_email: email,
          platform_token: password,
          grant_type: 'tractive',
        },
        headers: {
          'X-Tractive-Client': TractiveApi.CLIENT_ID,
          'Content-Type': 'application/json',
        },
      });

      // we cache the last authentication key
      this.authenticationStore.lastAuthenticationCache = response.data;

      this.logger.log(`User authentication successful`);

      return response.data;
    } catch (e) {
      throw e;
    }
  }

  /**
   * Returns if the user is authenticated with a token that has not expired yet.
   */
  public async isAuthenticated(): Promise<boolean> {
    return this.authenticationStore.hasValidAuthentication;
  }
}
