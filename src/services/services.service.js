import * as repository from "../repositories/services.repository.js"

const getServices = async (filters = {}) => {
    let result = await repository.getAll()
    
    if (filters.category !== undefined) {
      result = result.filter((service) => service.category.includes(filters.category));
    }

    if (filters.available !== undefined) {
      const isAvailable = filters.available === 'true' || filters.available === true;
      result = result.filter((service) => service.available === isAvailable);
    }

    return result
}

const getServiceById = (id) => {
   return repository.getById(id)
}

const createService = async (data) => {
    const requiredFields = ['name', 'description', 'duration', 'price', 'category', 'available'];

    const isComplete = requiredFields.every((field) => data[field] !== undefined);

    if (!isComplete) {
      return null;
    }

    return await repository.create(data)
}

const updateService = async (id, data) => {
    const existing = await getServiceById(id)

    if (existing === null) {
        return null
    }

    if ('id' in data) {
      return 'INVALID_ID';
    }

    return repository.update(id, data)
}

const deleteService = async (id) => {
    return await repository.delete(id)
}



export {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService
}