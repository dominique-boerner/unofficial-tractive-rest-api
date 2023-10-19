export class TrackerNotFoundException extends Error {
  constructor() {
    super();
    this.message =
      'Your tracker was not found. Please check if your tracker is online and check your tracker id.';
  }
}
