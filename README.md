# Services Admin

API REST con Node.js y Express para un sistema de citas y reservas de una peluquería. Persiste los datos en MongoDB usando Mongoose.

Además de la API, incluye vistas renderizadas en el servidor con Handlebars y actualizaciones en tiempo real con Socket.io: cuando se crea un servicio, aparece en la vista de servicios sin recargar la página.

> Requiere Node.js 20 o superior y una instancia de MongoDB (local o en la nube, por ejemplo MongoDB Atlas).

## Instalación

```bash
git clone https://github.com/TanMar23/services-admin
cd services-admin
npm install
cp .env.example .env
```

Completa `.env` con los valores necesarios (ver tabla abajo).

## Variables de entorno

| Variable    | Descripción                                              | Obligatoria | Ejemplo                                    |
| ----------- | -------------------------------------------------------- | ----------- | ------------------------------------------ |
| `PORT`      | Puerto en el que corre el servidor                       | No (`8080`) | `8080`                                     |
| `NODE_ENV`  | Entorno de ejecución (`development`, `production`, etc.) | Sí          | `development`                              |
| `MONGO_URI` | Cadena de conexión a MongoDB                             | Sí          | `mongodb://localhost:27017/services-admin` |

Si falta `NODE_ENV` o `MONGO_URI`, el servidor no arranca.

## Ejecutar

```bash
npm run dev     # con reinicio automático al detectar cambios
npm start       # sin reinicio automático
```

Al iniciar, el servidor primero se conecta a MongoDB y después empieza a escuchar en `http://localhost:<PORT>`. Si la conexión falla, el proceso termina con un error.

La API REST, las vistas y Socket.io comparten el mismo puerto.

## Arquitectura

El proyecto está organizado en capas. Cada request recorre el mismo camino y cada capa solo conoce a la de abajo:

```
Router → Middleware de validación (Zod) → Controller → Service → Repository → DAO → Model (Mongoose) → MongoDB
```

| Capa           | Carpeta                                | Responsabilidad                                                                                                                                                                                                                                                              |
| -------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Router**     | `src/routes/`                          | Define las rutas HTTP y las asocia a una función del controller. Si la ruta recibe datos, antepone el middleware de validación.                                                                                                                                              |
| **Validación** | `src/middlewares/` y `src/validators/` | Los esquemas de Zod (`validators/`) describen qué datos acepta cada endpoint. El middleware `validate` (`middlewares/`) los aplica a `body`, `query` o `params`: si algo es inválido responde 400 y la request no sigue; si no, deja los datos validados en `req.validated`. |
| **Controller** | `src/controllers/`                     | Lee los datos de `req.validated` (o `req.params` donde no hay validación), llama al service y traduce el resultado a una respuesta HTTP (código de estado + JSON `{ status, data, message }`).                                                                               |
| **Service**    | `src/services/`                        | Lógica de negocio: construye filtros, orden y paginación, asigna valores por defecto y combina recursos (por ejemplo, agregar un servicio a una reserva).                                                                                                                    |
| **Repository** | `src/repositories/`                    | Interfaz de acceso a datos que usa el service. Delega en el DAO, de modo que cambiar la forma de persistir no afecta a la lógica de negocio.                                                                                                                                 |
| **DAO**        | `src/dao/`                             | Acceso directo a la persistencia: usa los modelos de Mongoose para consultar y modificar MongoDB. Si el id no es un `ObjectId` válido devuelve `null`.                                                                                                                       |
| **Model**      | `src/models/`                          | Schemas de Mongoose: definen los campos, tipos, obligatorios y valores por defecto de cada colección.                                                                                                                                                                        |

Los datos inválidos se detienen en el middleware con un 400, antes de llegar al controller y a MongoDB. Las validaciones de los modelos de Mongoose quedan como segunda línea de defensa.

Los services informan que un recurso no existe devolviendo `null` o un código (`'SERVICE_NOT_FOUND'`, `'BOOKING_NOT_FOUND'`), y el controller responde 404.

Los errores inesperados (por ejemplo, que se caiga la conexión a MongoDB) no se atrapan en cada capa: suben hasta el middleware de errores, que genera una respuesta estándar (ver [Manejo de errores](#manejo-de-errores)).

Las vistas siguen el mismo camino que la API. La única diferencia es que su controller (`views.controller.js`) responde con `res.render` (HTML) en lugar de `res.json`, y usa los mismos services que los controllers de la API. La vista de servicios usa `getAllServices()`, que devuelve todos los servicios sin paginar.

### Estructura de carpetas

```
src/
├── server.js                # Crea el servidor HTTP, configura Socket.io y lo levanta en el puerto configurado
├── app.js                   # Crea la app de Express, configura Handlebars y archivos estáticos, monta los routers y el manejo de errores
├── config/
│   ├── env.config.js        # Carga y valida las variables de entorno
│   └── database.config.js   # Conexión a MongoDB con Mongoose
├── routes/                  # services.router.js, bookings.router.js, views.router.js
├── middlewares/
│   ├── validate.middleware.js   # Aplica los esquemas de Zod y responde 400 si los datos son inválidos
│   └── error.middleware.js      # Responde 404 a rutas inexistentes y unifica la respuesta ante errores
├── validators/
│   ├── common.validator.js      # Helpers compartidos: mensajes de obligatorio/tipo y validación de ObjectId
│   ├── services.validator.js    # Esquemas para crear, actualizar y listar servicios
│   └── bookings.validator.js    # Esquemas para crear reservas y agregarles servicios
├── controllers/             # services.controller.js, bookings.controller.js, views.controller.js
├── services/                # services.service.js, bookings.service.js
├── repositories/            # services.repository.js, bookings.repository.js
├── dao/                     # services.dao.js, bookings.dao.js
├── models/                  # service.model.js, booking.model.js
├── views/
│   ├── layouts/main.handlebars  # Layout común: estilos y scripts de Socket.io
│   ├── services.handlebars      # Listado de servicios
│   └── bookings.handlebars      # Listado de reservas
└── public/                  # Archivos estáticos servidos por Express
    ├── css/styles.css
    └── js/socket.js         # Cliente de Socket.io: escucha eventos y actualiza la vista
```

## Recurso `services`

Base: `/api/services`

| Método | Ruta    | Body                                                               | Descripción                                                                                                              |
| ------ | ------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| GET    | `/`     | —                                                                  | Lista servicios con filtros, paginación y ordenamiento (ver [Consultas avanzadas](#consultas-avanzadas-get-apiservices)) |
| GET    | `/:sid` | —                                                                  | Devuelve un servicio por id                                                                                              |
| POST   | `/`     | `{ name, description, duration, price, category, available }`      | Crea un servicio (MongoDB genera el `_id` automáticamente)                                                               |
| PUT    | `/:sid` | Uno o más campos a actualizar (no se permite enviar `id` ni `_id`) | Actualiza un servicio existente                                                                                          |
| DELETE | `/:sid` | —                                                                  | Elimina un servicio                                                                                                      |

### Consultas avanzadas (`GET /api/services`)

Todos los parámetros son opcionales y se pueden combinar. El filtrado, el orden y la paginación los resuelve MongoDB (no se traen todos los servicios a memoria).

| Parámetro                     | Valores                          | Por defecto | Descripción                                                                                                                                          |
| ----------------------------- | -------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `category`                    | texto o lista separada por comas | —           | Servicios que tengan al menos una de esas categorías en su array `category`. También acepta el parámetro repetido (`?category=corte&category=color`) |
| `search`                      | texto                            | —           | Busca el texto en `name` o `description` (sin distinguir mayúsculas)                                                                                 |
| `minPrice` / `maxPrice`       | número ≥ 0                       | —           | Rango de precio (inclusive). `minPrice` no puede ser mayor que `maxPrice`                                                                            |
| `minDuration` / `maxDuration` | número ≥ 0                       | —           | Rango de duración en minutos (inclusive). `minDuration` no puede ser mayor que `maxDuration`                                                         |
| `available`                   | `true` \| `false`                | —           | Filtra por disponibilidad                                                                                                                            |
| `page`                        | entero ≥ 1                       | `1`         | Página a devolver                                                                                                                                    |
| `limit`                       | entero entre 1 y 100             | `10`        | Cantidad de resultados por página                                                                                                                    |
| `sortBy`                      | `name` \| `price` \| `duration`  | `name`      | Campo por el que se ordena                                                                                                                           |
| `order`                       | `asc` \| `desc`                  | `asc`       | Sentido del orden                                                                                                                                    |

Si un parámetro tiene un valor no permitido (por ejemplo `page=0` o `sortBy=_id`), la API responde 400 (ver [Validaciones](#validaciones-zod)).

Ejemplos:

```bash
# Filtros: servicios de la categoría "corte" que estén disponibles
curl "http://localhost:8080/api/services?category=corte&available=true"

# Varias categorías: servicios de "corte" o de "color"
curl "http://localhost:8080/api/services?category=corte,color"

# Búsqueda por texto y rangos: "barba" en nombre o descripción, entre $200 y $600, hasta 45 minutos
curl "http://localhost:8080/api/services?search=barba&minPrice=200&maxPrice=600&maxDuration=45"

# Paginación: segunda página, con 5 resultados por página
curl "http://localhost:8080/api/services?page=2&limit=5"

# Ordenamiento: del más caro al más barato
curl "http://localhost:8080/api/services?sortBy=price&order=desc"

# Todo combinado: disponibles, ordenados por duración, primera página de 3
curl "http://localhost:8080/api/services?available=true&sortBy=duration&order=asc&page=1&limit=3"
```

La respuesta incluye el listado en `data` y los metadatos de paginación en `pagination`:

```json
{
  "status": "success",
  "data": [
    { "_id": "6650a1b2c3d4e5f6a7b8c9d0", "name": "Corte clásico", "price": 250, "...": "..." }
  ],
  "pagination": {
    "total": 12,
    "page": 2,
    "limit": 5,
    "totalPages": 3,
    "hasPrevPage": true,
    "hasNextPage": true
  }
}
```

| Campo         | Descripción                                          |
| ------------- | ---------------------------------------------------- |
| `total`       | Cantidad total de resultados que cumplen los filtros |
| `page`        | Página actual                                        |
| `limit`       | Resultados por página                                |
| `totalPages`  | Cantidad total de páginas (`0` si no hay resultados) |
| `hasPrevPage` | Si existe una página anterior                        |
| `hasNextPage` | Si existe una página siguiente                       |

Si se pide una página mayor a la última, la respuesta es 200 con `data: []`.

## Recurso `bookings`

Base: `/api/bookings`

| Método | Ruta                  | Body                                      | Descripción                                                                                  |
| ------ | --------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------- |
| POST   | `/`                   | `{ clientName, clientEmail, date, time }` | Crea una reserva. `_id`, `status` (`pending`) y `services` (`[]`) se asignan automáticamente |
| GET    | `/:bid`               | —                                         | Devuelve una reserva por id, con los datos completos de cada servicio (`populate`)           |
| POST   | `/:bid/services/:sid` | —                                         | Agrega un servicio existente a una reserva; si ya estaba agregado, incrementa su cantidad    |

### Consultar una reserva con sus servicios completos

En MongoDB, cada reserva guarda solo una referencia a cada servicio y su cantidad:

```js
services: [{ service: ObjectId('6650a1b2c3d4e5f6a7b8c9d0'), quantity: 2 }];
```

Al consultarla, `GET /api/bookings/:bid` usa `populate('services.service')` para reemplazar cada referencia por el servicio completo. `populate` solo se usa para leer: lo que queda guardado siguen siendo las referencias.

```bash
curl http://localhost:8080/api/bookings/6650a1b2c3d4e5f6a7b8c9e1
```

```json
{
  "status": "success",
  "data": {
    "_id": "6650a1b2c3d4e5f6a7b8c9e1",
    "clientName": "Ana",
    "clientEmail": "ana@mail.com",
    "date": "2026-10-20",
    "time": "10:00",
    "status": "pending",
    "services": [
      {
        "service": {
          "_id": "6650a1b2c3d4e5f6a7b8c9d0",
          "name": "Corte clásico",
          "description": "Corte con tijera y máquina",
          "duration": 30,
          "price": 250,
          "category": ["corte"],
          "available": true
        },
        "quantity": 2
      }
    ]
  }
}
```

Si un servicio de la reserva fue eliminado, ese elemento aparece con `"service": null`.

## Validaciones (Zod)

Los datos que recibe la API se validan con [Zod](https://zod.dev) en un middleware, antes de llegar al controller. Si algo es inválido, la API responde **400** y no se toca la base de datos.

| Endpoint                                | Esquema                     | Qué valida                                                                                                                                                                               |
| --------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/services`                    | `createServiceSchema`       | `name` y `description`: textos no vacíos. `duration`: entero mayor a 0 (minutos). `price`: número mayor a 0. `category`: array de textos. `available`: booleano. Todos son obligatorios. |
| `PUT /api/services/:sid`                | `updateServiceSchema`       | Los mismos campos y reglas que al crear, pero todos opcionales. Hay que enviar al menos uno, y no se aceptan campos que no existan en el servicio (como `id` o `_id`).                   |
| `GET /api/services`                     | `servicesQuerySchema`       | Los query params de [Consultas avanzadas](#consultas-avanzadas-get-apiservices). Convierte los textos de la URL a número o booleano y completa los valores por defecto.                  |
| `POST /api/bookings`                    | `createBookingSchema`       | `clientName`: texto no vacío. `clientEmail`: email válido. `date`: fecha real con formato `YYYY-MM-DD`. `time`: hora con formato `HH:mm` (24 horas). Todos son obligatorios.             |
| `POST /api/bookings/:bid/services/:sid` | `addServiceToBookingSchema` | `bid` y `sid` deben ser ObjectId válidos (24 caracteres hexadecimales).                                                                                                                  |

Al crear, los campos que no forman parte del esquema se descartan: por ejemplo, si se envía `status` al crear una reserva, se ignora y la reserva se crea como `pending`.

Ejemplo de respuesta con datos inválidos:

```bash
curl -X POST http://localhost:8080/api/services \
  -H "Content-Type: application/json" \
  -d '{"name":"Corte","price":"250","available":"si"}'
```

```json
{
  "status": "error",
  "message": "Datos inválidos",
  "errors": [
    { "location": "body", "field": "description", "message": "description es obligatorio" },
    { "location": "body", "field": "duration", "message": "duration es obligatorio" },
    { "location": "body", "field": "price", "message": "price debe ser un número" },
    { "location": "body", "field": "category", "message": "category es obligatorio" },
    { "location": "body", "field": "available", "message": "available debe ser true o false" }
  ]
}
```

`location` indica dónde estaba el dato (`body`, `query` o `params`) y `field`, qué campo falló.

## Manejo de errores

Los errores se manejan en un solo lugar, `src/middlewares/error.middleware.js`, que se monta al final de `app.js`:

- `notFoundHandler`: responde 404 si ninguna ruta coincide con la request.
- `errorHandler`: recibe cualquier error que se lance en un middleware, controller, service, repository o DAO. Express 5 le pasa automáticamente los errores de las funciones `async`, así que no hace falta `try/catch` en cada capa.

Todas las respuestas de error tienen la misma forma:

```json
{ "status": "error", "message": "Error interno del servidor" }
```

| Error                                                 | Código | Mensaje                                |
| ----------------------------------------------------- | ------ | -------------------------------------- |
| Ruta inexistente                                      | 404    | `Ruta GET /api/noexiste no encontrada` |
| Body con JSON mal formado                             | 400    | `El body no es un JSON válido`         |
| Body demasiado grande                                 | 413    | `El body es demasiado grande`          |
| Validación de Mongoose (`ValidationError`)            | 400    | `Los datos no cumplen el modelo`       |
| Valor con tipo incorrecto para Mongoose (`CastError`) | 400    | `El valor de <campo> no es válido`     |
| Clave única repetida en MongoDB (código `11000`)      | 409    | `El recurso ya existe`                 |
| Cualquier otro error                                  | 500    | `Error interno del servidor`           |

En los errores 500 el detalle completo (con el stack) se muestra por consola y no se envía al cliente, para no exponer información interna.

Los 400 de Zod (con el array `errors`) y los 404 de recursos que no existen siguen respondiéndose desde el middleware de validación y desde los controllers, porque no son excepciones sino casos esperados.

## Vistas (Handlebars)

Base: `/views`

| Ruta        | Descripción                                                                                                                |
| ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| `/services` | Lista los servicios guardados en MongoDB con nombre, descripción, precio, duración, disponibilidad y categorías            |
| `/bookings` | Lista las reservas con cliente, email, fecha, hora y estado, junto con los servicios de cada una (cargados con `populate`) |

Ninguna vista tiene datos fijos en el template: toda la información sale de la base a través de las capas.

## Tiempo real (Socket.io)

Socket.io comparte el servidor HTTP con Express, así que se conecta en el mismo puerto. El layout carga el cliente (`/socket.io/socket.io.js`) y `public/js/socket.js` en todas las vistas.

| Evento            | Cuándo se emite                                               | Qué hace el navegador                                                   |
| ----------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `service:created` | Después de crear un servicio con éxito (`POST /api/services`) | Si está en `/views/services`, agrega la tarjeta del servicio a la lista |

El controller obtiene la instancia de Socket.io con `req.app.get('io')` y emite el evento con el servicio recién creado. Si los datos son inválidos, la API responde 400 y no se emite nada.

### Cómo probarlo

1. Inicia el servidor (`npm run dev`) y abre `http://localhost:8080/views/services` en el navegador.
2. Desde otra terminal, crea un servicio:

```bash
curl -X POST http://localhost:8080/api/services \
  -H "Content-Type: application/json" \
  -d '{"name":"Corte de prueba","description":"Probando Socket.io","duration":30,"price":250,"category":["corte"],"available":true}'
```

3. La tarjeta nueva aparece en el navegador sin recargar la página.

## Persistencia

Los datos se guardan en MongoDB, en las colecciones `services` y `bookings` de la base indicada en `MONGO_URI`. Los ids son `ObjectId` de MongoDB (campo `_id`); si se pide un recurso con un id que no tiene formato válido, la API responde 404. La excepción es `POST /api/bookings/:bid/services/:sid`, que valida los ids con Zod y responde 400.

Solo la capa DAO accede a la base de datos a través de los modelos de Mongoose, así que el cambio de archivos JSON a MongoDB no requirió modificar controllers ni routers.
