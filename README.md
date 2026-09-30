# Services Admin

API REST con Node.js y Express para un sistema de turnos y reservas de una peluquería. Persiste los datos en MongoDB usando Mongoose.

> Requiere Node.js 20 o superior y una instancia de MongoDB (local o en la nube, por ejemplo MongoDB Atlas).

## Instalación

```bash
git clone https://github.com/TanMar23/services-admin
cd services-admin
npm install
cp .env.example .env
```

Completá `.env` con los valores necesarios (ver tabla abajo).

## Variables de entorno

| Variable    | Descripción                                              | Obligatoria | Ejemplo                                    |
| ----------- | -------------------------------------------------------- | ----------- | ------------------------------------------ |
| `PORT`      | Puerto en el que corre el servid                         |
| `NODE_ENV`  | Entorno de ejecución (`development`, `production`, etc.) | Sí          | `development`                              |
| `MONGO_URI` | Cadena de conexión a MongoDB                             | Sí          | `mongodb://localhost:27017/services-admin` |

Si falta `NODE_ENV` o `MONGO_URI`, el servidor no arranca.

## Ejecutar

```bash
npm run dev     # con reinicio automático al detectar cambios
npm start       # sin reinicio automático
```

Al iniciar, el servidor primero se conecta a MongoDB y después empieza a escuchar en `http://localhost:<PORT>`. Si la conexión falla, el proceso termina con un error.

## Arquitectura

El proyecto está organizado en capas. Cada request recorre el mismo camino y cada capa solo conoce a la de abajo:

```
Router → Controller → Service → Repository → DAO → Model (Mongoose) → MongoDB
```

| Capa           | Carpeta             | Responsabilidad                                                                                                                                                 |
| -------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Router**     | `src/routes/`       | Define las rutas HTTP y las asocia a una función del controller.                                                                                                |
| **Controller** | `src/controllers/`  | Lee `req.params`, `req.query` y `req.body`, llama al service y traduce el resultado a una respuesta HTTP (código de estado + JSON `{ status, data, message }`). |
| **Service**    | `src/services/`     | Lógica de negocio: valida campos obligatorios, aplica filtros, asigna valores por defecto y combina recursos (por ejemplo, agregar un servicio a una reserva).  |
| **Repository** | `src/repositories/` | Interfaz de acceso a datos que usa el service. Delega en el DAO, de modo que cambiar la forma de persistir no afecta a la lógica de negocio.                    |
| **DAO**        | `src/dao/`          | Acceso directo a la persistencia: usa los modelos de Mongoose para consultar y modificar MongoDB. Si el id no es un `ObjectId` válido devuelve `null`.          |
| **Model**      | `src/models/`       | Schemas de Mongoose: definen los campos, tipos, obligatorios y valores por defecto de cada colección.                                                           |

Los services informan errores devolviendo `null` o un código (`'INVALID_ID'`, `'SERVICE_NOT_FOUND'`, `'BOOKING_NOT_FOUND'`), y el controller decide qué código HTTP corresponde (400 o 404).

### Estructura de carpetas

```
src/
├── server.js                # Levanta el servidor en el puerto configurado
├── app.js                   # Crea la app de Express y monta los routers
├── config/
│   ├── env.config.js        # Carga y valida las variables de entorno
│   └── database.config.js   # Conexión a MongoDB con Mongoose
├── routes/                  # services.router.js, bookings.router.js
├── controllers/             # services.controller.js, bookings.controller.js
├── services/                # services.service.js, bookings.service.js
├── repositories/            # services.repository.js, bookings.repository.js
├── dao/                     # services.dao.js, bookings.dao.js
├── models/                  # service.model.js, booking.model.js
```

## Recurso `services`

Base: `/api/services`

| Método | Ruta    | Body                                                          | Descripción                                                            |
| ------ | ------- | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| GET    | `/`     | —                                                             | Lista servicios. Filtros opcionales por query: `category`, `available` |
| GET    | `/:sid` | —                                                             | Devuelve un servicio por id                                            |
| POST   | `/`     | `{ name, description, duration, price, category, available }` | Crea un servicio (MongoDB genera el `_id` automáticamente)             |
| PUT    | `/:sid` | Campos a actualizar (no se permite modificar `id`)            | Actualiza un servicio existente                                        |
| DELETE | `/:sid` | —                                                             | Elimina un servicio                                                    |

## Recurso `bookings`

Base: `/api/bookings`

| Método | Ruta                  | Body                                      | Descripción                                                                                  |
| ------ | --------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------- |
| POST   | `/`                   | `{ clientName, clientEmail, date, time }` | Crea una reserva. `_id`, `status` (`pending`) y `services` (`[]`) se asignan automáticamente |
| GET    | `/:bid`               | —                                         | Devuelve una reserva por id                                                                  |
| POST   | `/:bid/services/:sid` | —                                         | Agrega un servicio existente a una reserva; si ya estaba agregado, incrementa su cantidad    |

## Persistencia

Los datos se guardan en MongoDB, en las colecciones `services` y `bookings` de la base indicada en `MONGO_URI`. Los ids son `ObjectId` de MongoDB (campo `_id`); si se pide un recurso con un id que no tiene formato válido, la API responde 404.

Solo la capa DAO accede a la base de datos a través de los modelos de Mongoose, así que el cambio de archivos JSON a MongoDB no requirió modificar controllers ni routers.
