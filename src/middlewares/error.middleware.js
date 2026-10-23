import mongoose from 'mongoose';

const toHttpError = (err) => {
  if (err.type === 'entity.parse.failed') {
    return { statusCode: 400, message: 'El body no es un JSON válido' };
  }

  if (err.type === 'entity.too.large') {
    return { statusCode: 413, message: 'El body es demasiado grande' };
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return { statusCode: 400, message: 'Los datos no cumplen el modelo' };
  }

  if (err instanceof mongoose.Error.CastError) {
    return { statusCode: 400, message: `El valor de ${err.path} no es válido` };
  }

  // Índice único repetido en MongoDB
  if (err.code === 11000) {
    return { statusCode: 409, message: 'El recurso ya existe' };
  }

  // Otros errores de Express que ya traen un código 4xx
  const status = err.status ?? err.statusCode;
  if (status >= 400 && status < 500) {
    return { statusCode: status, message: 'Solicitud inválida' };
  }

  return { statusCode: 500, message: 'Error interno del servidor' };
};

// Rutas que no coinciden con ningún router
const notFoundHandler = (req, res) => {
  return res.status(404).json({
    status: 'error',
    message: `Ruta ${req.method} ${req.originalUrl} no encontrada`,
  });
};

// Express lo reconoce como manejador de errores porque recibe 4 parámetros
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const { statusCode, message } = toHttpError(err);

  if (statusCode >= 500) {
    console.error(`Error en ${req.method} ${req.originalUrl}:`, err);
  }

  return res.status(statusCode).json({
    status: 'error',
    message,
  });
};

export { notFoundHandler, errorHandler };
