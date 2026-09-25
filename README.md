# Services Admin

API REST con Node.js y Express para un sistema de turnos y reservas de una peluquería. Persiste los datos en archivos JSON (`src/data/`), sin base de datos.

> Requiere Node.js 20 o superior.

## Instalación

```bash
git clone https://github.com/TanMar23/services-admin
cd services-admin
npm install
cp .env.example .env
```

Completá `.env` con los valores necesarios (ver tabla abajo).

## Variables de entorno

| Variable   | Descripción                                              | Ejemplo       |
| ---------- | -------------------------------------------------------- | ------------- |
| `PORT`     | Puerto en el que corre el servidor                       | ``            |
| `NODE_ENV` | Entorno de ejecución (`development`, `production`, etc.) | `development` |

Ambas son obligatorias: si falta alguna, el servidor no arranca.

## Ejecutar

```bash
npm run dev     # con reinicio automático al detectar cambios
npm start       # sin reinicio automático
```

El servidor queda disponible en `http://localhost:<PORT>`.

## Arquitectura

El proyecto está organizado en capas. Cada request recorre el mismo camino y cada capa solo conoce a la de abajo:

```
Router → Controller → Service → Repository → DAO → archivo JSON
```

| Capa           | Carpeta             | Responsabilidad                                                                                                                                                 |
| -------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Router**     | `src/routes/`       | Define las rutas HTTP y las asocia a una función del controller.                                                                                                |
| **Controller** | `src/controllers/`  | Lee `req.params`, `req.query` y `req.body`, llama al service y traduce el resultado a una respuesta HTTP (código de estado + JSON `{ status, data, message }`). |
| **Service**    | `src/services/`     | Lógica de negocio: valida campos obligatorios, aplica filtros, asigna valores por defecto y combina recursos (por ejemplo, agregar un servicio a una reserva).  |
| **Repository** | `src/repositories/` | Interfaz de acceso a datos que usa el service. Delega en el DAO, de modo que cambiar la forma de persistir no afecta a la lógica de negocio.                    |
| **DAO**        | `src/dao/`          | Acceso directo a la persistencia: lee y escribe los archivos JSON de `src/data/` y genera los `id` con `crypto.randomUUID()`.                                   |

Los services informan errores devolviendo `null` o un código (`'INVALID_ID'`, `'SERVICE_NOT_FOUND'`, `'BOOKING_NOT_FOUND'`), y el controller decide qué código HTTP corresponde (400 o 404).

### Estructura de carpetas

```
src/
├── server.js                # Levanta el servidor en el puerto configurado
├── app.js                   # Crea la app de Express y monta los routers
├── config/
│   └── env.config.js        # Carga y valida las variables de entorno
├── routes/                  # services.router.js, bookings.router.js
├── controllers/             # services.controller.js, bookings.controller.js
├── services/                # services.service.js, bookings.service.js
├── repositories/            # services.repository.js, bookings.repository.js
├── dao/                     # services.dao.js, bookings.dao.js
└── data/                    # services.json, bookings.json
```

## Recurso `services`

Base: `/api/services`

| Método | Ruta    | Body                                                          | Descripción                                                            |
| ------ | ------- | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| GET    | `/`     | —                                                             | Lista servicios. Filtros opcionales por query: `category`, `available` |
| GET    | `/:sid` | —                                                             | Devuelve un servicio por id                                            |
| POST   | `/`     | `{ name, description, duration, price, category, available }` | Crea un servicio (el `id` se genera automáticamente)                   |
| PUT    | `/:sid` | Campos a actualizar (no se permite modificar `id`)            | Actualiza un servicio existente                                        |
| DELETE | `/:sid` | —                                                             | Elimina un servicio                                                    |

## Recurso `bookings`

Base: `/api/bookings`

| Método | Ruta                  | Body                                      | Descripción                                                                                 |
| ------ | --------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------- |
| POST   | `/`                   | `{ clientName, clientEmail, date, time }` | Crea una reserva. `id`, `status` (`pending`) y `services` (`[]`) se asignan automáticamente |
| GET    | `/:bid`               | —                                         | Devuelve una reserva por id                                                                 |
| POST   | `/:bid/services/:sid` | —                                         | Agrega un servicio existente a una reserva; si ya estaba agregado, incrementa su cantidad   |

## Persistencia

Los datos se guardan en `src/data/services.json` y `src/data/bookings.json`, y no se pierden al reiniciar el servidor. Solo la capa DAO accede a estos archivos; para migrar a una base de datos alcanzaría con reemplazar los DAO (o apuntar los repositories a una nueva implementación) sin tocar services ni controllers.
