import { Router } from 'express';
import {
  getBookingById,
  createBooking,
  addServiceToBooking,
} from '../controllers/bookings.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createBookingSchema,
  addServiceToBookingSchema,
} from '../validators/bookings.validator.js';

const router = Router();

router.get('/:bid', getBookingById);

router.post('/', validate({ body: createBookingSchema }), createBooking);

router.post(
  '/:bid/services/:sid',
  validate({ params: addServiceToBookingSchema }),
  addServiceToBooking
);

export default router;
