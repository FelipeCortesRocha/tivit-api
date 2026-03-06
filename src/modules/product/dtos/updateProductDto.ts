import { z } from 'zod';
import { ProductStatus } from '../product.entity';

export const updateProductSchema = z
  .object({
    name: z.string().optional(),
    description: z.string().optional(),
    status: z.enum([ProductStatus.ACTIVE, ProductStatus.ARCHIVED]).optional(),
    attributesToAdd: z
      .string()
      .regex(new RegExp('(?<key>[^:]+):(?<value>[^,]+),?'), {
        message: 'Invalid attributes to add',
      })
      .optional(),
    attributesToRemove: z
      .string()
      .regex(new RegExp('(?<key>[^:]+),?'), {
        message: 'Invalid attributes to remove',
      })
      .optional(),
    categoriesToAdd: z.array(z.uuid()).optional(),
    categoriesToRemove: z.array(z.uuid()).optional(),
  })
  .refine(
    (data) =>
      data.name ||
      data.description ||
      data.status ||
      data.attributesToAdd ||
      data.attributesToRemove ||
      data.categoriesToAdd ||
      data.categoriesToRemove,
    {
      message: 'At least one field should be provided.',
      path: [
        'name',
        'description',
        'status',
        'attributesToAdd',
        'attributesToRemove',
        'categoriesToAdd',
        'categoriesToRemove',
      ],
    },
  );

export type UptadeProductDto = z.infer<typeof updateProductSchema>;
