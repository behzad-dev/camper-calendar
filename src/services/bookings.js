import { z } from 'zod';
import api from './api';

export const BookingDetail = z.object({
  id: z.string(),
  customerName: z.string(),
  pickupReturnStationId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
}).passthrough();

export const BookingDetails = z.array(BookingDetail);

export async function fetchBookingDetails() {
  const { data } = await api.get('bookingDetails.json');
  return BookingDetails.parse(data);
}

export async function fetchBookingDetail(id) {
  const all = await fetchBookingDetails();
  return all.find(b => b.id === id) || null;
}
