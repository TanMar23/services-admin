import * as dao from '../dao/services.dao.js';

const getAll = () => {
  return dao.getAll();
};

const paginate = (filter, options) => {
  return dao.paginate(filter, options);
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

export { getAll, paginate, getById, create, update, deleteById as delete };
