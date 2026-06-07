import axios from 'axios';
import { LocationService } from './location.service';
import { AuthenticationStore } from '../store/authentication.store';
import { TrackerDto } from '../../dto/tracker.dto';
import { TrackerNotFoundException } from '../../exceptions/TrackerNotFoundException';
import { TractiveLocation } from '../../interfaces/tractive-location.interface';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('LocationService', () => {
  let service: LocationService;

  const dto = (trackerId: string): TrackerDto => ({ trackerId } as TrackerDto);
  const location = (id: string): TractiveLocation =>
    ({ _id: id, latlong: [1, 2] } as unknown as TractiveLocation);

  beforeEach(() => {
    const store = new AuthenticationStore();
    store.lastAuthenticationCache = {
      user_id: 'u',
      client_id: 'c',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      access_token: 'token',
    };
    service = new LocationService(store);
    jest.clearAllMocks();
  });

  it('returns the fetched location for a tracker', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: location('a') });

    await expect(service.getTrackerLocation(dto('tracker-a'))).resolves.toEqual(
      location('a'),
    );
  });

  it('does not fall back to another tracker\'s cached location on error', async () => {
    // tracker A succeeds and gets cached
    mockedAxios.get.mockResolvedValueOnce({ data: location('a') });
    await service.getTrackerLocation(dto('tracker-a'));

    // tracker B fails and has never succeeded -> must NOT return A's data
    mockedAxios.get.mockRejectedValueOnce(new Error('tractive down'));
    await expect(
      service.getTrackerLocation(dto('tracker-b')),
    ).rejects.toBeInstanceOf(TrackerNotFoundException);
  });

  it('falls back to the tracker\'s own last known location on a later error', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: location('a') });
    await service.getTrackerLocation(dto('tracker-a'));

    mockedAxios.get.mockRejectedValueOnce(new Error('tractive down'));
    await expect(service.getTrackerLocation(dto('tracker-a'))).resolves.toEqual(
      location('a'),
    );
  });
});
