import { Router } from 'express';
import {
  getBookingById,
  createBooking,
  addServiceToBooking,
} from '../controllers/bookings.controller.js';

const router = Router();

router.get('/:bid', getBookingById);

router.post('/', createBooking);

router.post('/:bid/services/:sid', addServiceToBooking);

export default router;
