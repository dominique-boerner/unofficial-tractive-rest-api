import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
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

  /**
   * Caches the last known hardware report per tracker id, so a transient error
   * for one tracker can fall back to that tracker's own last value — never
   * another tracker's.
   */
  private readonly lastReportCache = new Map<string, TractiveHardware>();

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
    this.logger.log(`Get hardware report for one tracker`);

    const bearer = this.authenticationStore.accessToken;
    if (!bearer) {
      throw new NotAuthenticatedException();
    }

    try {
      return await this.fetchTrackerHardware(trackerId);
    } catch (e) {
      throw e;
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
    this.logger.log(`Get hardware report for ${trackerIds.length} trackers`);

    try {
      const promises = trackerIds.map((trackerId) =>
        this.fetchTrackerHardware(trackerId),
      );
      return await Promise.all<TractiveHardware>(promises);
    } catch (e) {
      throw e;
    }
  }

  /**
   * Get the battery level of a single tracker
   * @param trackerDto the tracker to get the battery level from.
   */
  public async getBatteryLevel(trackerDto: TrackerDto): Promise<number> {
    this.logger.log(`Get battery level for one tracker`);

    try {
      const result = await this.fetchTrackerHardware(trackerDto.trackerId);
      return result.battery_level;
    } catch (e) {
      throw e;
    }
  }

  /**
   * Get the battery level of multiple trackers.
   * @param trackerIds the tracker ids to get battery level from.
   */
  public async getBatteryLevels(trackerIds: string[]): Promise<number[]> {
    this.logger.log(`Get battery level for ${trackerIds.length} trackers`);

    try {
      const promises = trackerIds.map((trackerId) =>
        this.fetchTrackerHardware(trackerId),
      );
      const result = await Promise.all<TractiveHardware>(promises);
      return result.map((report) => report.battery_level);
    } catch (e) {
      throw e;
    }
  }

  /**
   * Fetch tracker hardware report
   * @param trackerId the id of the tracker
   * @private
   */
  private async fetchTrackerHardware(
    trackerId: string,
  ): Promise<TractiveHardware> {
    const bearer = this.authenticationStore.accessToken;
    if (!bearer) {
      throw new NotAuthenticatedException();
    }

    try {
      const url = `${TractiveApi.BASE_URL}/device_hw_report/${trackerId}`;

      const response = await axios.get(url, {
        headers: {
          'X-Tractive-Client': TractiveApi.CLIENT_ID,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearer}`,
        },
      });

      // cache the last known report for this tracker
      this.lastReportCache.set(trackerId, response.data);

      this.logger.log(`Tracker hardware report found`);

      return response.data;
    } catch (e) {
      const cachedReport = this.lastReportCache.get(trackerId);
      if (cachedReport) {
        this.logger.error(
          `Error while getting tracker hardware report. Return last known report for this tracker instead`,
        );
        return cachedReport;
      }

      throw new TrackerNotFoundException();
    }
  }
}
