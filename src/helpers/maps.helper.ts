import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { map } from 'rxjs';

export const mapsDistanceData = async (
  dto: any,
  config: ConfigService,
  httpService: HttpService,
) => {
  const url = 'https://maps.googleapis.com/maps/api/distancematrix/json';
  const params = {
    units: 'metric',
    origins: `${dto.pickupLocation.latitude},${dto.pickupLocation.longitude}`,
    destinations: `${dto.dropoffLocation.latitude},${dto.dropoffLocation.longitude}`,
    key: config.get('GOOGLE_MAPS_API_KEY'),
  };

  const response = await httpService
    .get(url, { params })
    .pipe(map((response) => response.data))
    .toPromise();

  return {
    ...response,
    distance: response.rows[0].elements[0].distance?.text,
    distanceValue: response.rows[0].elements[0].distance?.value / 1000,
  };
};
