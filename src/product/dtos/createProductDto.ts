import { z } from 'zod';

export const createProductSchema = z
  .object({
    name: z.string(),
    attributes: z.string(),
  })
  .required();

export type CreateProductDto = z.infer<typeof createProductSchema>;
