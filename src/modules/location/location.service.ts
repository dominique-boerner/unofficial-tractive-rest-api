import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { TrackerDto } from '../../dto/tracker.dto';
import { NotAuthenticatedException } from '../../exceptions/NotAuthenticated.exception';
import { AuthenticationStore } from '../store/authentication.store';
import { TrackerNotFoundException } from '../../exceptions/TrackerNotFoundException';
import { TractiveLocation } from '../../interfaces/tractive-location.interface';
import { TractiveApi } from '../../constants';

/**
 * Service for getting location information from the tracker.
 */
@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  private lastLocationCache = null;

  constructor(private readonly authenticationStore: AuthenticationStore) {}

  /**
   * Get the tracker location
   *
   * We cache the last tracker location, because if tractive gets many requests,
   * this could return null.
   * @param trackerDto the tracker id
   */
  public async getTrackerLocation(trackerDto: TrackerDto) {
    let trackerId = trackerDto.trackerId;
    this.logger.log(`Get tracker location for tracker '${trackerId}'`);

    const bearer = this.authenticationStore.accessToken;
    if (!bearer) {
      throw new NotAuthenticatedException();
    }

    try {
      return await this.fetchTrackerLocation(trackerId);
    } catch (e) {
      throw e;
    }
  }

  /**
   * Get multiple tracker locations
   *
   * We cache the last tracker location, because if tractive gets many requests,
   * this could return null.
   * @param trackerIds ids of the tracker, separated by comma
   */
  public async getTrackerLocations(trackerIds: string[]) {
    this.logger.log(`Get tracker location for trackers '${trackerIds}'`);

    try {
      const promises = trackerIds.map((trackerId) =>
        this.fetchTrackerLocation(trackerId),
      );
      return await Promise.all<TractiveLocation>(promises);
    } catch (e) {
      throw e;
    }
  }

  /**
   * Fetch a tracker location
   * @param trackerId the id of the tracker
   * @private
   */
  private async fetchTrackerLocation(
    trackerId: string,
  ): Promise<TractiveLocation> {
    const bearer = this.authenticationStore.accessToken;
    if (!bearer) {
      throw new NotAuthenticatedException();
    }
    try {
      const url = `${TractiveApi.BASE_URL}/device_pos_report/${trackerId}`;

      const response = await axios.get(url, {
        headers: {
          'X-Tractive-Client': '625e533dc3c3b41c28a669f0',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearer}`,
        },
      });

      // we cache the last location
      this.lastLocationCache = response.data;

      this.logger.log(`Tracker location found`);

      return response.data;
    } catch (e) {
      if (e instanceof NotAuthenticatedException) {
        throw e;
      }

      if (this.lastLocationCache) {
        this.logger.error(
          `Error while getting tracker location. Return last tracker location instead`,
        );
        return this.lastLocationCache;
      }

      throw new TrackerNotFoundException();
    }
  }
}
