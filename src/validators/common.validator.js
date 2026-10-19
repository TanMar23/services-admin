import { z } from 'zod';

const requiredError = (field, type) => (issue) =>
  issue.input === undefined ? `${field} es obligatorio` : `${field} debe ser ${type}`;

// Un ObjectId de MongoDB son 24 caracteres hexadecimales
const objectId = (field) =>
  z
    .string({ error: requiredError(field, 'un texto') })
    .regex(/^[0-9a-fA-F]{24}$/, { error: `${field} no es un id válido` });

export { requiredError, objectId };
