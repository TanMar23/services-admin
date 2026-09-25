import * as bookingsService from '../services/bookings.service.js';

const getBookingById = async (req, res) => {
  const { bid } = req.params;
  const data = await bookingsService.getBookingById(bid);

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
};

const createBooking = async (req, res) => {
  const newBookingData = await bookingsService.createBooking(req.body);

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
};

const addServiceToBooking = async (req, res) => {
  const { bid, sid } = req.params;

  const updateBookingData = await bookingsService.addServiceToBooking(bid, sid);

  if (updateBookingData === 'SERVICE_NOT_FOUND') {
    return res.status(404).json({
      status: 'error',
      message: `Servicio con id ${sid} no encontrado`,
    });
  }

  if (updateBookingData === 'BOOKING_NOT_FOUND') {
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
};

export { getBookingById, createBooking, addServiceToBooking };
