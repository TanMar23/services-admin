import * as dao from '../dao/bookings.dao.js';

const create = (data) => {
  return dao.create(data);
};

const getAll = () => {
  return dao.getAll();
};

const getById = (id) => {
  return dao.getById(id);
};

const update = (id, data) => {
  return dao.update(id, data);
};

export { create, getAll, getById, update };
