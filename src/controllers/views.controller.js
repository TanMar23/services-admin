import * as service from '../services/services.service.js';

const renderServices = async (req, res) => {
  const services = await service.getServices();
  res.render('services', { title: 'Servicios', services });
};

export { renderServices };

// API => entrega JSON
// res.render => entrega HTML
