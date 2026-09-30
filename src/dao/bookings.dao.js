import mongoose from 'mongoose';
import Booking from '../models/booking.model.js';

const create = async (data) => {
  try {
    const newBooking = await Booking.create(data);
    return newBooking.toObject();
  } catch (error) {
    console.error('Error al crear booking en MongoDB:', error);
    throw error;
  }
};

const getById = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  try {
    const booking = await Booking.findById(id).lean();
    return booking ?? null;
  } catch (error) {
    console.error('Error al buscar booking por ID en MongoDB:', error);
    throw error;
  }
};

const update = async (id, updatedData) => {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  try {
    const updatedBooking = await Booking.findByIdAndUpdate(id, updatedData, {
      returnDocument: 'after',
    }).lean();

    return updatedBooking ?? null;
  } catch (error) {
    console.error('Error al actualizar booking en MongoDB:', error);
    throw error;
  }
};

export { create, getById, update };
