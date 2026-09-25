import * as dao from '../dao/services.dao.js';

const getAll = () => {
  return dao.getAll();
};

const getById = (id) => {
  return dao.getById(id);
};

const create = (data) => {
  return dao.create(data);
};

const update = (id, data) => {
  return dao.update(id, data);
};

const deleteById = (id) => {
  return dao.delete(id);
};

export { getAll, getById, create, update, deleteById as delete };
