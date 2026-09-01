import fs from 'node:fs/promises';
export default class ServiceManager {
  // Al ServiceManager no le importa cuál es el path, solo sabe que se lo pasamos
  readServices = async (path) => {
    try {
      const data = await fs.readFile(path, 'utf-8');

      return JSON.parse(data).services;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }

      throw error;
    }
  };

  writeServices = async (path, services) => {
    await fs.writeFile(path, JSON.stringify({ services }, null, 2));
  };

  getServices = async (filters = {}, path) => {
    let result = await this.readServices(path);

    if (filters.category !== undefined) {
      result = result.filter((service) => service.category.includes(filters.category));
    }

    if (filters.available !== undefined) {
      const isAvailable = filters.available === 'true' || filters.available === true;
      result = result.filter((service) => service.available === isAvailable);
    }

    return result;
  }; // → devuelve todos los servicios y filtra por category y available

  getServiceById = async (id, path) => {
    const result = (await this.readServices(path)).find((service) => service.id === id) || null;
    return result;
  }; // → devuelve el servicio o null/mensaje de error

  addService = async (serviceData, path) => {
    const requiredFields = ['name', 'description', 'duration', 'price', 'category', 'available'];

    const isComplete = requiredFields.every((field) => serviceData[field] !== undefined);

    if (!isComplete) {
      return null;
    }

    serviceData.id = crypto.randomUUID();

    const services = await this.readServices(path);

    services.push(serviceData);

    await this.writeServices(path, services);

    return serviceData;
  }; //  agrega un servicio; el id se genera automáticamente (no se recibe como parámetro); valida que estén presentes: name, description, duration, price, category, available; rechaza servicios incompletos

  updateService = async (id, updatedData, path) => {
    const services = await this.readServices(path);
    const serviceToUpdate = services.find((service) => service.id === id);

    if (!serviceToUpdate) {
      return null;
    }

    if ('id' in updatedData) {
      return 'INVALID_ID';
    }

    Object.assign(serviceToUpdate, updatedData);
    await this.writeServices(path, services);
    return serviceToUpdate;
  }; // → actualiza el servicio; no permite modificar el id; devuelve null/error si no existe

  deleteService = async (id, path) => {
    const services = await this.readServices(path);

    const position = services.findIndex((service) => service.id === id);
    if (position !== -1) {
      services.splice(position, 1);
      await this.writeServices(path, services);
      return true;
    } else {
      return null;
    }
  }; // → elimina el servicio; devuelve null/error si no existe
}
