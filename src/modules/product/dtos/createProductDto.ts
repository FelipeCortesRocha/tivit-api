import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  attributes: z
    .string()
    .regex(new RegExp('(?<key>[^:]+):(?<value>[^,]+),?'), {
      message: 'Invalid attributes',
    })
    .optional(),
  categories: z.array(z.uuid()).optional(),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
