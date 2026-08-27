export default class ServiceManager {
  constructor(services) {
    this.services = services
  }

  getServices = (filters = {}) => {
    let result = this.services

    if (filters.category !== undefined) {
      result = result.filter(service => service.category.includes(filters.category))
    }
  

    if (filters.available !== undefined) {
      const isAvailable = filters.available === "true"
      result = result.filter(service => service.available === isAvailable)
    }

    return result
  }; // → devuelve todos los servicios

  getServiceById = (id) => {
    const result = this.services.find(service => service.id === id) || null
    return result
  }; // → devuelve el servicio o null/mensaje de error

  addService = (serviceData) => {    
    const requiredFields = ['name', 'description', 'duration', 'price', 'category', 'available']

    const isComplete = requiredFields.every(field => serviceData[field] !== undefined)

    if (!isComplete) {
        return null
    }

    serviceData.id = crypto.randomUUID()

    this.services.push(serviceData)

    return serviceData

  }; //  agrega un servicio; el id se genera automáticamente (no se recibe como parámetro); valida que estén presentes: name, description, duration, price, category, available; rechaza servicios incompletos

  updateService = (id, updatedData) => {
    const serviceToUpdate = this.services.find(service => service.id === id)

    if (!serviceToUpdate) {
        return null
    }

     if ('id' in updatedData) {
        return "INVALID_ID"
    }

    Object.assign(serviceToUpdate, updatedData)
    return serviceToUpdate
    
  }; // → actualiza el servicio; no permite modificar el id; devuelve null/error si no existe

  deleteService = (id) => {
    const position = this.services.findIndex(p => p.id === id)
    if (position !== -1) {
        this.services.splice(position, 1)
        return true
    } else {
        return null
    }
  }; // → elimina el servicio; devuelve null/error si no existe
}
