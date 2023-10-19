import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as process from 'process';
import { TractiveAuth } from '../../interfaces/tractive-auth.interface';
import { AuthenticationStore } from '../store/authentication.store';

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
    const url = 'https://graph.tractive.com/4/auth/token';
    const email = process.env.TRACTIVE_EMAIL;
    const password = process.env.TRACTIVE_PASSWORD;

    this.logger.log(`Authenticate the user '${email}'`);

    // TODO: check if "this.authenticationStore.lastAuthenticationCache.expires_at" is bigger
    //       than current date.
    if (this.authenticationStore.lastAuthenticationCache) {
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
          'X-Tractive-Client': '625e533dc3c3b41c28a669f0',
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
}
