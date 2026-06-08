import axios from 'axios';
import { HardwareService } from './hardware.service';
import { AuthenticationStore } from '../store/authentication.store';
import { TrackerDto } from '../../dto/tracker.dto';
import { TrackerNotFoundException } from '../../exceptions/TrackerNotFoundException';
import { TractiveHardware } from '../../interfaces/tractive-hardware.interface';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HardwareService', () => {
  let service: HardwareService;

  const dto = (trackerId: string): TrackerDto => ({ trackerId } as TrackerDto);
  const report = (id: string, battery: number): TractiveHardware =>
    ({ _id: id, battery_level: battery } as unknown as TractiveHardware);

  beforeEach(() => {
    const store = new AuthenticationStore();
    store.lastAuthenticationCache = {
      user_id: 'u',
      client_id: 'c',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      access_token: 'token',
    };
    service = new HardwareService(store);
    jest.clearAllMocks();
  });

  it('returns the fetched hardware report for a tracker', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: report('a', 80) });

    await expect(service.getTrackerHardware(dto('tracker-a'))).resolves.toEqual(
      report('a', 80),
    );
  });

  it('does not fall back to another tracker\'s cached report on error', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: report('a', 80) });
    await service.getTrackerHardware(dto('tracker-a'));

    mockedAxios.get.mockRejectedValueOnce(new Error('tractive down'));
    await expect(
      service.getTrackerHardware(dto('tracker-b')),
    ).rejects.toBeInstanceOf(TrackerNotFoundException);
  });

  it('falls back to the tracker\'s own last known report on a later error', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: report('a', 80) });
    await service.getTrackerHardware(dto('tracker-a'));

    mockedAxios.get.mockRejectedValueOnce(new Error('tractive down'));
    await expect(service.getTrackerHardware(dto('tracker-a'))).resolves.toEqual(
      report('a', 80),
    );
  });
});
