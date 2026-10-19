import { z } from 'zod';
import { requiredError } from './common.validator.js';

const createServiceSchema = z.object({
  name: z
    .string({ error: requiredError('name', 'un texto') })
    .trim()
    .min(1, { error: 'name no puede estar vacío' }),
  description: z
    .string({ error: requiredError('description', 'un texto') })
    .trim()
    .min(1, { error: 'description no puede estar vacío' }),
  // duración en minutos
  duration: z
    .number({ error: requiredError('duration', 'un número') })
    .int({ error: 'duration debe ser un número entero de minutos' })
    .positive({ error: 'duration debe ser mayor a 0' }),
  price: z
    .number({ error: requiredError('price', 'un número') })
    .positive({ error: 'price debe ser mayor a 0' }),
  category: z.array(
    z.string({ error: 'cada category debe ser un texto' }).trim().min(1, {
      error: 'category no puede contener textos vacíos',
    }),
    { error: requiredError('category', 'un array de textos') }
  ),
  available: z.boolean({ error: requiredError('available', 'true o false') }),
});

// Mismos campos que al crear, pero todos opcionales. Rechaza campos desconocidos (por ejemplo id o _id)
const updateServiceSchema = z
  .strictObject(createServiceSchema.shape, {
    error: (issue) =>
      issue.code === 'unrecognized_keys'
        ? `No se pueden modificar estos campos: ${issue.keys.join(', ')}`
        : 'El body debe ser un objeto JSON',
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    error: 'Enviá al menos un campo para actualizar',
  });

// Los query params siempre llegan como texto, por eso se convierten a número o booleano
const servicesQuerySchema = z.object({
  category: z.string().trim().min(1, { error: 'category no puede estar vacío' }).optional(),
  available: z
    .enum(['true', 'false'], { error: 'available debe ser true o false' })
    .transform((value) => value === 'true')
    .optional(),
  page: z.coerce
    .number({ error: 'page debe ser un número' })
    .int({ error: 'page debe ser un número entero' })
    .min(1, { error: 'page debe ser mayor o igual a 1' })
    .default(1),
  limit: z.coerce
    .number({ error: 'limit debe ser un número' })
    .int({ error: 'limit debe ser un número entero' })
    .min(1, { error: 'limit debe ser mayor o igual a 1' })
    .max(100, { error: 'limit no puede ser mayor a 100' })
    .default(10),
  sortBy: z
    .enum(['name', 'price', 'duration'], { error: 'sortBy debe ser name, price o duration' })
    .default('name'),
  order: z.enum(['asc', 'desc'], { error: 'order debe ser asc o desc' }).default('asc'),
});

export { createServiceSchema, updateServiceSchema, servicesQuerySchema };
