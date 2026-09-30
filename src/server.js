import { app } from './app.js';
import { connectDB } from './config/database.config.js';
import envConfig from './config/env.config.js';

const PORT = envConfig.port;

const startServer = async () => {
  await connectDB();
  // Línea que levanta o crea el servidor
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
};

startServer();
