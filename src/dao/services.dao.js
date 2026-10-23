import mongoose from 'mongoose';
import Service from '../models/service.model.js';

const getAll = async () => {
  const services = await Service.find().lean();
  return services;
};

const paginate = async (filter, { skip, limit, sort }) => {
  const [docs, total] = await Promise.all([
    Service.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Service.countDocuments(filter),
  ]);
  return { docs, total };
};

const getById = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  const service = await Service.findById(id).lean();
  return service ?? null;
};

const create = async (data) => {
  const newService = await Service.create(data);
  return newService.toObject();
};

const update = async (id, updatedData) => {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  const updatedService = await Service.findByIdAndUpdate(id, updatedData, {
    returnDocument: 'after',
  }).lean();

  return updatedService ?? null;
};

const deleteById = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  const deletedService = await Service.findByIdAndDelete(id).lean();
  return deletedService ?? null;
};

export { getAll, paginate, getById, create, update, deleteById as delete };
