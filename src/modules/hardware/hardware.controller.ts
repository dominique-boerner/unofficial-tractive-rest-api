import { Controller, Get, HttpStatus, Logger, Param } from '@nestjs/common';
import { HardwareService } from './hardware.service';
import { ApiResponse } from '../../interfaces/api-response';
import { TractiveLocation } from '../../interfaces/tractive-location.interface';
import { AxiosError } from 'axios';
import { TrackerDto } from '../../dto/tracker.dto';

/**
 * Controller for getting hardware information.
 */
@Controller({
  path: 'hardware',
})
export class HardwareController {
  private readonly logger = new Logger(HardwareController.name);

  constructor(private readonly hardwareService: HardwareService) {}

  /**
   * Get hardware report of a tracker.
   * @param trackerDto the trackerId
   * @example
   * // get hardware report of a single tracker
   * POST "http://localhost:3000/hardware
   * body { trackerId: "mytrackerid" }
   *
   * // get hardware report of multiple trackers
   * POST "http://localhost:3000/hardware
   * body { trackerId: "firsttrackerid,secondtrackerid,thirdtrackerid" }
   */
  @Get(':trackerId')
  async getHardwareReport(
    @Param() trackerDto: TrackerDto,
  ): Promise<ApiResponse<TractiveLocation>> {
    try {
      let data;
      let hasMultipleTrackerIds = trackerDto.trackerId.includes(',');
      if (hasMultipleTrackerIds) {
        const trackerIds: string[] = trackerDto.trackerId.split(',');
        data = await this.hardwareService.getTrackerLocations(trackerIds);
      } else {
        data = await this.hardwareService.getTrackerHardware(trackerDto);
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
      this.logger.error(
        `Error while getting tracker hardware report: ${e.message}`,
      );
      return {
        status,
        data: null,
        message: e.message,
      };
    }
  }

  /**
   * Get battery level of a tracker.
   * @param trackerDto the trackerId
   * @example
   * // get battery report of a single tracker
   * POST "http://localhost:3000/hardware/battery
   * body { trackerId: "mytrackerid" }
   *
   * // get battery report of multiple trackers
   * POST "http://localhost:3000/hardware/battery
   * body { trackerId: "firsttrackerid,secondtrackerid,thirdtrackerid" }
   */
  @Get('battery/:trackerId')
  async getBattery(
    @Param() trackerDto: TrackerDto,
  ): Promise<ApiResponse<TractiveLocation>> {
    try {
      let data;
      let hasMultipleTrackerIds = trackerDto.trackerId.includes(',');
      if (hasMultipleTrackerIds) {
        const trackerIds: string[] = trackerDto.trackerId.split(',');
        data = await this.hardwareService.getBatteryLevels(trackerIds);
      } else {
        data = await this.hardwareService.getBatteryLevel(trackerDto);
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
      this.logger.error(
        `Error while getting tracker battery level: ${e.message}`,
      );
      return {
        status,
        data: null,
        message: e.message,
      };
    }
  }
}
