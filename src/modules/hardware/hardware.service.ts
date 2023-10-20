import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { NotAuthenticatedException } from '../../exceptions/NotAuthenticated.exception';
import { AuthenticationStore } from '../store/authentication.store';
import { TrackerNotFoundException } from '../../exceptions/TrackerNotFoundException';
import { TrackerDto } from '../../dto/tracker.dto';
import { TractiveHardware } from '../../interfaces/tractive-hardware.interface';
import { TractiveApi } from '../../constants';

/**
 * Service for getting hardware information from the tracker.
 */
@Injectable()
export class HardwareService {
  private readonly logger = new Logger(HardwareService.name);

  private lastReportCache: TractiveHardware = null;

  constructor(private readonly authenticationStore: AuthenticationStore) {}

  /**
   * Get tracker hardware information for a single tracker.
   *
   * We cache the last tracker hardware report, because if tractive gets many requests,
   * this could return null.
   * @param trackerDto the tracker id
   */
  public async getTrackerHardware(
    trackerDto: TrackerDto,
  ): Promise<TractiveHardware> {
    let trackerId = trackerDto.trackerId;
    this.logger.log(`Get hardware report for tracker '${trackerId}'`);

    const bearer = this.authenticationStore.accessToken;
    if (!bearer) {
      throw new NotAuthenticatedException();
    }

    try {
      return await this.fetchTrackerHardware(trackerId);
    } catch (e) {
      if (this.lastReportCache) {
        this.logger.error(
          `Error while getting tracker hardware report. Return last report instead`,
        );
        return this.lastReportCache;
      }

      throw new TrackerNotFoundException();
    }
  }

  /**
   * Get tracker hardware information for multiple tracker.
   *
   * We cache the last tracker hardware report, because if tractive gets many requests,
   * this could return null.
   * @param trackerIds the tracker ids
   */
  public async getTrackerLocations(
    trackerIds: string[],
  ): Promise<TractiveHardware[]> {
    this.logger.log(`Get hardware report for trackers '${trackerIds}'`);

    try {
      const promises = trackerIds.map((trackerId) =>
        this.fetchTrackerHardware(trackerId),
      );
      return await Promise.all<TractiveHardware>(promises);
    } catch (e) {
      if (this.lastReportCache) {
        this.logger.error(
          `Error while getting tracker location. Return last tracker location instead`,
        );
        return trackerIds.map(() => this.lastReportCache);
      }

      throw new TrackerNotFoundException();
    }
  }

  /**
   * Get the battery level of a single tracker
   * @param trackerDto the tracker to get the battery level from.
   */
  public async getBatteryLevel(trackerDto: TrackerDto): Promise<number> {
    this.logger.log(`Get battery level for tracker '${trackerDto}'`);

    try {
      const result = await this.fetchTrackerHardware(trackerDto.trackerId);
      return result.battery_level;
    } catch (e) {
      if (this.lastReportCache) {
        this.logger.error(
          `Error while getting battery level. Return last battery level instead`,
        );
        return this.lastReportCache.battery_level;
      }

      throw new TrackerNotFoundException();
    }
  }

  /**
   * Get the battery level of multiple trackers.
   * @param trackerIds the tracker ids to get battery level from.
   */
  public async getBatteryLevels(trackerIds: string[]): Promise<number[]> {
    this.logger.log(`Get battery level for trackers '${trackerIds}'`);

    try {
      const promises = trackerIds.map((trackerId) =>
        this.fetchTrackerHardware(trackerId),
      );
      const result = await Promise.all<TractiveHardware>(promises);
      return result.map((report) => report.battery_level);
    } catch (e) {
      if (this.lastReportCache) {
        this.logger.error(
          `Error while getting battery level. Return last battery level instead`,
        );
        return trackerIds.map(() => this.lastReportCache.battery_level);
      }

      throw new TrackerNotFoundException();
    }
  }

  /**
   * Fetch a tracker location
   * @param trackerId the id of the tracker
   * @private
   */
  private async fetchTrackerHardware(
    trackerId: string,
  ): Promise<TractiveHardware> {
    try {
      const url = `${TractiveApi.BASE_URL}/device_hw_report/${trackerId}`;
      const bearer = this.authenticationStore.accessToken;
      if (!bearer) {
        throw new NotAuthenticatedException();
      }

      const response = await axios.get(url, {
        headers: {
          'X-Tractive-Client': '625e533dc3c3b41c28a669f0',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearer}`,
        },
      });

      // we cache the last location
      this.lastReportCache = response.data;

      this.logger.log(`Tracker location found`);

      return response.data;
    } catch (e) {
      if (this.lastReportCache) {
        this.logger.error(
          `Error while getting tracker hardware report. Return last report instead`,
        );
        return this.lastReportCache;
      }

      console.log(e instanceof NotAuthenticatedException);

      if (e instanceof AxiosError || e instanceof NotAuthenticatedException) {
        throw e;
      }
      throw new TrackerNotFoundException();
    }
  }
}
