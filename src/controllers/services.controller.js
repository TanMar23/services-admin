import * as service from '../services/services.service.js';

const getServices = async (req, res) => {
  const { category, available } = req.query;
  const data = await service.getServices({ category, available });

  return res.status(200).json({
    status: 'success',
    data,
  });
};

const getServiceById = async (req, res) => {
  const { sid } = req.params;
  const data = await service.getServiceById(sid);

  if (data === null) {
    return res.status(404).json({
      status: 'error',
      message: `Elemento con id ${sid} no encontrado`,
    });
  }
  return res.status(200).json({
    status: 'success',
    data,
  });
};

const createService = async (req, res) => {
  const newServiceData = await service.createService(req.body);

  if (newServiceData === null) {
    return res.status(400).json({
      status: 'error',
      message: 'Error, no fue posible crear nuevo elemento',
    });
  }

  return res.status(201).json({
    status: 'success',
    data: newServiceData,
    message: 'Nuevo elemento creado exitosamente',
  });
};

const updateService = async (req, res) => {
  const { sid } = req.params;
  const updatedData = await service.updateService(sid, req.body);

  if (updatedData === null) {
    return res.status(404).json({
      status: 'error',
      message: 'Error: el recurso a actualizar no existe',
    });
  }

  if (updatedData === 'INVALID_ID') {
    return res.status(400).json({
      status: 'error',
      message: 'Error: intentaste modificar el id',
    });
  }

  return res.status(200).json({
    status: 'success',
    data: updatedData,
    message: 'Elemento actualizado exitosamente',
  });
};

const deleteService = async (req, res) => {
  const { sid } = req.params;
  const deleteItem = await service.deleteService(sid);

  if (deleteItem === null) {
    return res.status(404).json({
      status: 'error',
      message: 'Error al borrar elemento',
    });
  }
  return res.status(200).json({
    status: 'success',
    message: `Elemento con id ${sid} eliminado exitosamente`,
  });
};

export { getServices, getServiceById, createService, updateService, deleteService };
