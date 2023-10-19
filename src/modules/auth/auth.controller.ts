import { Controller, Logger, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TractiveAuth } from '../../interfaces/tractive-auth.interface';

/**
 * This controller handles authentication of the user against the tractive API.
 */
@Controller({
  path: 'auth',
})
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * Authenticate the user against the tractive api.
   * The email and password is inside the .env file of the api.
   * @example
   * POST "http://localhost:3000/auth
   */
  @Post()
  async authenticate(): Promise<TractiveAuth> {
    try {
      return await this.authService.authenticate();
    } catch (e) {
      this.logger.log(`Error while authentication: ${e.message}`);
    }
  }
}
