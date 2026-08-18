# Services Admin

Proyecto Node.js (ESM) que implementa una clase `ServiceManager` para gestionar los servicios de un sistema de turnos y reservas (agregar, consultar, actualizar y eliminar servicios).

## Cómo instalar

1. Clona el repositorio y entra a la carpeta del proyecto:

   ```bash
   git clone <url-del-repositorio>
   cd services-admin
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Crea tu archivo de variables de entorno a partir del ejemplo incluido:

   ```bash
   cp .env.example .env
   ```

   Luego completa los valores en `.env` (ver sección [Variables de entorno necesarias](#variables-de-entorno-necesarias)).

> Requiere Node.js 20 o superior (usa `crypto.randomUUID()` y sintaxis ESM nativa).

## Cómo ejecutar

```bash
node src/app.js
```

Esto carga los servicios desde `src/data/services.json`, crea una instancia de `ServiceManager` y ejecuta el script de ejemplo definido en `src/app.js`.

## Variables de entorno necesarias

| Variable   | Descripción                                              | Ejemplo      |
| ---------- | --------------------------------------------------------- | ------------ |
| `PORT`     | Puerto en el que correrá la aplicación                    | `3000`       |
| `NODE_ENV` | Entorno de ejecución (`development`, `production`, etc.)  | `development`|

Ambas variables son obligatorias: si falta alguna, la aplicación se detiene al arrancar (ver `src/config/env.config.js`).

## Recurso `services`

Cada servicio tiene la siguiente forma:

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "duration": "string",
  "price": "number",
  "category": "string",
  "available": "boolean"
}
```

| Campo         | Tipo      | Descripción                                             |
| ------------- | --------- | -------------------------------------------------------- |
| `id`          | `string`  | Identificador único. Se genera automáticamente al crear un servicio; no puede modificarse después. |
| `name`        | `string`  | Nombre del servicio (ej. "Corte de pelo mujer").          |
| `description` | `string`  | Descripción breve del servicio.                           |
| `duration`    | `string`  | Duración estimada (ej. "1 hora").                         |
| `price`       | `number`  | Precio del servicio.                                      |
| `category`    | `string`  | Categoría a la que pertenece el servicio.                 |
| `available`   | `boolean` | Indica si el servicio está disponible para reservarse.     |

Los datos se almacenan en `src/data/services.json`.

## `ServiceManager`

Clase que gestiona la colección de servicios. Recibe el arreglo inicial de servicios por parámetro en su constructor:

```js
import { readFileSync } from 'node:fs';
import ServiceManager from './managers/ServiceManager.js';

const { services } = JSON.parse(
  readFileSync(new URL('./data/services.json', import.meta.url))
);

const manager = new ServiceManager(services);
```

### `getServices()`

Devuelve todos los servicios.

```js
manager.getServices();
// → [ { id: '1', name: 'Corte de pelo mujer', ... }, { id: '2', ... }, ... ]
```

### `getServiceById(id)`

Devuelve el servicio con el `id` indicado, o `null` si no existe.

```js
manager.getServiceById('1');
// → { id: '1', name: 'Corte de pelo mujer', description: '...', duration: '1 hora', price: 400, category: '', available: true }

manager.getServiceById('id-inexistente');
// → null
```

### `addService(serviceData)`

Agrega un nuevo servicio. El `id` se genera automáticamente (no se recibe como parámetro). Valida que `serviceData` incluya `name`, `description`, `duration`, `price`, `category` y `available`; si falta alguno, rechaza la operación.

```js
manager.addService({
  name: 'Permanente',
  description: 'Enchinado de pelo',
  duration: '4 horas',
  price: 2000,
  category: '',
  available: true,
});
// → 'Nuevo servicio creado'

manager.addService({ name: 'Servicio incompleto' });
// → null
```

### `updateService(id, updatedData)`

Actualiza el servicio con el `id` indicado usando los campos de `updatedData`. No permite modificar el `id`. Devuelve `null` si el servicio no existe o si `updatedData` intenta cambiar el `id`.

```js
manager.updateService('1', { price: 450, available: false });
// → 'El servicio con id 1 ha sido actualizado'

manager.updateService('id-inexistente', { price: 450 });
// → null

manager.updateService('1', { id: 'otro-id' });
// → null
```

### `deleteService(id)`

Elimina el servicio con el `id` indicado. Devuelve `null` si no existe.

```js
manager.deleteService('3');
// → 'El servicio con id 3 fue eliminado'

manager.deleteService('id-inexistente');
// → null
```
