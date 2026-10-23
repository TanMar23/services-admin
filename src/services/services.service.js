import * as repository from '../repositories/services.repository.js';

// Escapa los caracteres especiales para que search se busque como texto literal
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Arma { $gte, $lte } solo con los límites que vinieron
const rangeFilter = (min, max) => {
  const range = {};

  if (min !== undefined) {
    range.$gte = min;
  }

  if (max !== undefined) {
    range.$lte = max;
  }

  return Object.keys(range).length > 0 ? range : undefined;
};

const getServices = async ({
  category,
  search,
  minPrice,
  maxPrice,
  minDuration,
  maxDuration,
  available,
  page,
  limit,
  sortBy,
  order,
}) => {
  const filter = {};

  // Servicios que tengan al menos una de las categorías pedidas
  if (category !== undefined) {
    filter.category = { $in: category };
  }

  if (search !== undefined) {
    const regex = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: regex }, { description: regex }];
  }

  const price = rangeFilter(minPrice, maxPrice);
  if (price !== undefined) {
    filter.price = price;
  }

  const duration = rangeFilter(minDuration, maxDuration);
  if (duration !== undefined) {
    filter.duration = duration;
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
