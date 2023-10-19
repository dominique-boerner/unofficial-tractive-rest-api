export class NotAuthenticatedException extends Error {
  constructor() {
    super();
    this.message =
      'You are not authenticated. Please authenticate via the /auth endpoint.';
  }
}
