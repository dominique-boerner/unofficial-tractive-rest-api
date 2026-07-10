import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import { TrackerDto } from "../../dto/tracker.dto";
import { NotAuthenticatedException } from "../../exceptions/NotAuthenticated.exception";
import { AuthenticationStore } from "../store/authentication.store";
import { TrackerNotFoundException } from "../../exceptions/TrackerNotFoundException";
import { TractiveLocation } from "../../interfaces/tractive-location.interface";
import { TractiveApi } from "../../constants";

/**
 * Service for getting location information from the tracker.
 */
@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  /**
   * Caches the last known location per tracker id, so a transient error for one
   * tracker can fall back to that tracker's own last value — never another
   * tracker's.
   */
  private readonly lastLocationCache = new Map<string, TractiveLocation>();

  constructor(private readonly authenticationStore: AuthenticationStore) {}

  /**
   * Get the tracker location.
   * @param trackerDto the tracker id
   */
  public async getTrackerLocation(
    trackerDto: TrackerDto,
  ): Promise<TractiveLocation> {
    let trackerId = trackerDto.trackerId;
    this.logger.log(`Get tracker location for one tracker`);

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
   * Get multiple tracker locations.
   * @param trackerIds ids of the tracker, separated by comma
   */
  public async getTrackerLocations(
    trackerIds: string[],
  ): Promise<TractiveLocation[]> {
    this.logger.log(`Get tracker location for ${trackerIds.length} trackers`);

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
          'X-Tractive-Client': TractiveApi.CLIENT_ID,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearer}`,
        },
      });

      // cache the last known location for this tracker
      this.lastLocationCache.set(trackerId, response.data);

      this.logger.log(`Tracker location found`);

      return response.data;
    } catch (e) {
      if (e instanceof NotAuthenticatedException) {
        throw e;
      }

      const cachedLocation = this.lastLocationCache.get(trackerId);
      if (cachedLocation) {
        this.logger.error(
          `Error while getting tracker location. Return last known location for this tracker instead`,
        );
        return cachedLocation;
      }

      throw new TrackerNotFoundException();
    }
  }
}
