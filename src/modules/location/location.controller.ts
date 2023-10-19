import { Controller, Get, HttpStatus, Logger, Param } from '@nestjs/common';
import { LocationService } from './location.service';
import { TrackerDto } from './tracker.dto';
import { ApiResponse } from '../../interfaces/api-response';
import { TractiveLocation } from '../../interfaces/tractive-location.interface';
import { AxiosError } from 'axios';

/**
 * Controller for getting tracker locations.
 */
@Controller({
  path: 'location',
})
export class LocationController {
  private readonly logger = new Logger(LocationController.name);

  constructor(private readonly locationService: LocationService) {}

  /**
   * Get tracker location of a single or multiple trackers.
   * @param trackerDto the trackerId
   * @example
   * // get location of a single tracker
   * POST "http://localhost:3000/location
   * body { trackerId: "mytrackerid" }
   *
   * // get location of multiple trackers
   * POST "http://localhost:3000/location
   * body { trackerId: "firsttrackerid,secondtrackerid,thirdtrackerid" }
   */
  @Get(':trackerId')
  async getTrackerLocation(
    @Param() trackerDto: TrackerDto,
  ): Promise<ApiResponse<TractiveLocation>> {
    try {
      let data;
      let hasMultipleTrackerIds = trackerDto.trackerId.includes(',');
      if (hasMultipleTrackerIds) {
        const trackerIds: string[] = trackerDto.trackerId.split(',');
        data = await this.locationService.getTrackerLocations(trackerIds);
      } else {
        data = await this.locationService.getTrackerLocation(trackerDto);
      }
      return {
        status: HttpStatus.OK,
        data,
      };
    } catch (e) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      if (e instanceof AxiosError) {
        status = e.response.status;
      }
      this.logger.error(`Error while getting tracker location: ${e.message}`);
      return {
        status,
        data: null,
        message: e.message,
      };
    }
  }
}
