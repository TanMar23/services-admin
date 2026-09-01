import { Router } from 'express';
import BookingManager from '../managers/BookingManager.js';
import ServiceManager from '../managers/ServiceManager.js';

const router = Router();

const bookingsPath = new URL('../data/bookings.json', import.meta.url)
const servicesPath = new URL('../data/services.json', import.meta.url);

const serviceManager = new ServiceManager();
const bookingManager = new BookingManager();

router.get('/:bid', async (req, res) => {
  const { bid } = req.params
  const data = await bookingManager.getBookingById(bid, bookingsPath)

  if (data === null) {
    return res.status(404).json({
      status: 'error',
      message: `Reserva con id ${bid} no encontrada`,
    });
  }

  return res.status(200).json({
    status: 'success',
    data,
  });
});

router.post('/', async (req, res) => {
  const newBookingData = await bookingManager.createBooking(req.body, bookingsPath);

  if (newBookingData === null) {
    return res.status(400).json({
      status: 'error',
      message: 'Error, no fue posible crear nueva reserva',
    });
  }

  return res.status(201).json({
    status: 'success',
    data: newBookingData,
    message: 'Nueva reserva creada exitosamente',
  });
});

router.post('/:bid/services/:sid', async(req, res) => {
  const { bid, sid } = req.params

  const service = await serviceManager.getServiceById(sid, servicesPath)

  if (service === null) {
    return res.status(404).json({
      status: 'error',
      message: `Servicio con id ${sid} no encontrado`,
    });
  }

  const updateBookingData = await bookingManager.addServiceToBooking(bid, sid, bookingsPath)

  if (updateBookingData === null) {
    return res.status(404).json({
      status: 'error',
      message: `Reserva con id ${bid} no encontrada`,
    });
  }

  return res.status(200).json({
    status: 'success',
    data: updateBookingData,
    message: 'Reserva actualizada exitosamente',
  });
})

export default router;