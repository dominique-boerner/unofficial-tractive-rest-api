import { Controller, HttpStatus, Logger, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TractiveAuth } from '../../interfaces/tractive-auth.interface';
import { ApiResponse } from '../../interfaces/api-response';
import { AxiosError } from 'axios';

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
  async authenticate(): Promise<ApiResponse<TractiveAuth>> {
    try {
      let data = await this.authService.authenticate();
      const okResponse: ApiResponse<TractiveAuth> = {
        status: HttpStatus.OK,
        data,
      };
      return okResponse;
    } catch (e) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      if (e instanceof AxiosError) {
        status = e.response.status;
      }
      const errorResponse: ApiResponse<TractiveAuth> = {
        status,
        data: null,
        message: e.message,
      };
      this.logger.log(`Error while authentication: ${e.message}`);
      return errorResponse;
    }
  }
}
