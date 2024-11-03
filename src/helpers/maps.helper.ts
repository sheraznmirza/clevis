import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { map } from 'rxjs';

export const mapsDistanceData = async (
  to: {
    latitude?: number;
    longitude?: number;
  },
  from: {
    latitude: number;
    longitude: number;
  },
  config: ConfigService,
  httpService: HttpService,
) => {
  const url = 'https://maps.googleapis.com/maps/api/distancematrix/json';
  const params = {
    units: 'metric',
    origins: `${from.latitude},${from.longitude}`,
    destinations: `${to.latitude},${to.longitude}`,
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
