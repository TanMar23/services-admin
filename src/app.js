import express from 'express';
import { engine } from 'express-handlebars';
import servicesRouter from './routes/services.router.js';
import bookingsRouter from './routes/bookings.router.js';
import viewsRouter from './routes/views.router.js';

import path from 'path';

export const app = express();

// Para poder recibir desde el body, sino no podemos recibir (permite leer datos enviados en formato JSON.)
app.use(express.json());

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(import.meta.dirname, 'views'));

// TODO: Investigar qué es una ruta absoluta
// Qué significa que express "no sirve archivos por su cuenta"
app.use(express.static(path.join(import.meta.dirname, 'public')));

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API del sistema de turnos y reservas con PORT',
  });
});

// conecta el router de servicios.
app.use('/api/services', servicesRouter);

// conecta el router de reservas
app.use('/api/bookings', bookingsRouter);

// conecta el router de vistas con handlebars
app.use('/views', viewsRouter);
