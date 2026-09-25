import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const FILE_PATH = path.join(__dirname, '../data/services.json')

const readServices = async () => {
    try {
      const data = await fs.readFile(FILE_PATH, 'utf-8');
       return JSON.parse(data).services;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }

      throw error;
    }
  };

const writeServices = async (services) => {
    await fs.writeFile(FILE_PATH, JSON.stringify({ services }, null, 2));
  };

const getAll = async () => {
    return await readServices();
}

const getById = async (id) => {
    const result = (await getAll()).find((service) => service.id === id) || null;
    return result;
}

const create = async (data) => {
    const newService = {...data, id: crypto.randomUUID() }

    const services = await getAll();

    services.push(newService);

    await writeServices(services);

    return newService;
}

const update = async (id, updatedData) => {
    const services = await getAll();

    const serviceToUpdate = services.find((service) => service.id === id);

    if (!serviceToUpdate) {
      return null;
    }

    Object.assign(serviceToUpdate, updatedData);

     await writeServices(services);

    return serviceToUpdate;
}

const deleteById = async (id) => {
    const services = await getAll();

     const position = services.findIndex((service) => service.id === id);

    if (position !== -1) {
      services.splice(position, 1);
      await writeServices( services);
      return true;
    } else {
      return null
    }
    
}

export {
    getAll,
    getById,
    create,
    update,
    deleteById as delete
}

