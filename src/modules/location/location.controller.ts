import { Controller, Get, Logger, Param } from '@nestjs/common';
import { LocationService } from './location.service';
import { TrackerDto } from './tracker.dto';

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
  async getTrackerLocation(@Param() trackerDto: TrackerDto): Promise<any> {
    try {
      let hasMultipleTrackerIds = trackerDto.trackerId.includes(',');
      if (hasMultipleTrackerIds) {
        const trackerIds: string[] = trackerDto.trackerId.split(',');
        return await this.locationService.getTrackerLocations(trackerIds);
      }
      return await this.locationService.getTrackerLocation(trackerDto);
    } catch (e) {
      this.logger.error(`Error while getting tracker location: ${e.message}`);
      return e;
    }
  }
}
