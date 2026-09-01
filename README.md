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

Los datos se guardan en `src/data/services.json` y `src/data/bookings.json`, y no se pierden al reiniciar el servidor.
