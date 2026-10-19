import * as repository from '../repositories/services.repository.js';

const getServices = async ({ category, available, page, limit, sortBy, order }) => {
  const filter = {};

  if (category !== undefined) {
    filter.category = category;
  }

  if (available !== undefined) {
    filter.available = available;
  }

  const direction = order === 'desc' ? -1 : 1;
  const sort = { [sortBy]: direction, _id: direction };

  const { docs, total } = await repository.paginate(filter, {
    skip: (page - 1) * limit,
    limit,
    sort,
  });

  const totalPages = Math.ceil(total / limit);

  return {
    docs,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
    },
  };
};

const getAllServices = () => {
  return repository.getAll();
};

const getServiceById = (id) => {
  return repository.getById(id);
};

const createService = async (data) => {
  return await repository.create(data);
};

const updateService = async (id, data) => {
  const existing = await getServiceById(id);

  if (existing === null) {
    return null;
  }

  return repository.update(id, data);
};

const deleteService = async (id) => {
  return await repository.delete(id);
};

export { getServices, getAllServices, getServiceById, createService, updateService, deleteService };
