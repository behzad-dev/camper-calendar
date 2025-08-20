import { z } from 'zod';
import api from './api';

export const Booking = z
  .object({
    id: z.string(),
    pickupReturnStationId: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    customerName: z.string().optional(),
  })
  .passthrough();

export const Station = z.object({
  id: z.string(),
  name: z.string(),
  bookings: z.array(Booking),
});

export const Stations = z.array(Station);

export async function fetchStations() {
  const { data } = await api.get('stations.json'); 
  return Stations.parse(data);
}
