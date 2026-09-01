import { Router } from 'express';
import ServiceManager from '../managers/ServiceManager.js';

const router = Router();

const dataPath = new URL('../data/services.json', import.meta.url);

const manager = new ServiceManager();

router.get('/', async (req, res) => {
  const { category, available } = req.query;
  const data = await manager.getServices({ category, available }, dataPath);
  return res.status(200).json({
    status: 'success',
    data,
  });
});

router.get('/:sid', async (req, res) => {
  const { sid } = req.params;
  const data = await manager.getServiceById(sid, dataPath);

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
});

router.post('/', async (req, res) => {
  const newServiceData = await manager.addService(req.body, dataPath);

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
});

router.put('/:sid', async (req, res) => {
  const { sid } = req.params;
  const updatedData = await manager.updateService(sid, req.body, dataPath);

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
});

router.delete('/:sid', async (req, res) => {
  const { sid } = req.params;
  const deleteItem = await manager.deleteService(sid, dataPath);

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
});

export default router;
