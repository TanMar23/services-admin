import { z } from 'zod';
import { requiredError, objectId } from './common.validator.js';

// status y services no se reciben: los asigna el service al crear la reserva
const createBookingSchema = z.object({
  clientName: z
    .string({ error: requiredError('clientName', 'un texto') })
    .trim()
    .min(1, { error: 'clientName no puede estar vacío' }),
  clientEmail: z.email({ error: requiredError('clientEmail', 'un email válido') }),
  // formato YYYY-MM-DD, y además tiene que ser una fecha real
  date: z.iso.date({ error: requiredError('date', 'una fecha con formato YYYY-MM-DD') }),
  // formato HH:mm en 24 horas
  time: z
    .string({ error: requiredError('time', 'un texto') })
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, { error: 'time debe tener formato HH:mm (24 horas)' }),
});

// Valida los params de POST /api/bookings/:bid/services/:sid
const addServiceToBookingSchema = z.object({
  bid: objectId('bid'),
  sid: objectId('sid'),
});

export { createBookingSchema, addServiceToBookingSchema };
