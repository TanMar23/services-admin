import mongoose from 'mongoose';
import Booking from '../models/booking.model.js';

const create = async (data) => {
  const newBooking = await Booking.create(data);
  return newBooking.toObject();
};

const getAll = async () => {
  const bookings = await Booking.find().populate('services.service').lean();
  return bookings;
};

const getById = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  const booking = await Booking.findById(id).lean();
  return booking ?? null;
};

const getByIdPopulated = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  const booking = await Booking.findById(id).populate('services.service').lean();
  return booking ?? null;
};

const update = async (id, updatedData) => {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  const updatedBooking = await Booking.findByIdAndUpdate(id, updatedData, {
    returnDocument: 'after',
  }).lean();

  return updatedBooking ?? null;
};

export { create, getAll, getById, getByIdPopulated, update };
