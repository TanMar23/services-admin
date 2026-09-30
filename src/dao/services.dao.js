import mongoose from 'mongoose';
import Service from '../models/service.model.js';

const getAll = async () => {
  try {
    const services = await Service.find().lean();
    return services;
  } catch (error) {
    console.error('Error al obtener los servicios de Mongo', error);
    throw error;
  }
};

const getById = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  try {
    const service = await Service.findById(id).lean();
    return service ?? null;
  } catch (error) {
    console.error('Error al buscar servicio por ID en MongoDB:', error);
    throw error;
  }
};

const create = async (data) => {
  try {
    const newService = await Service.create(data);
    return newService.toObject();
  } catch (error) {
    console.error('Error al crear servicio en MongoDB:', error);
    throw error;
  }
};

const update = async (id, updatedData) => {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  try {
    const updatedService = await Service.findByIdAndUpdate(id, updatedData, {
      returnDocument: 'after',
    }).lean();

    return updatedService ?? null;
  } catch (error) {
    console.error('Error al actualizar servicio en MongoDB:', error);
    throw error;
  }
};

const deleteById = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  try {
    const deletedService = await Service.findByIdAndDelete(id).lean();
    return deletedService ?? null;
  } catch (error) {
    console.error('Error al eliminar servicio de MongoDB:', error);
    throw error;
  }
};

export { getAll, getById, create, update, deleteById as delete };
