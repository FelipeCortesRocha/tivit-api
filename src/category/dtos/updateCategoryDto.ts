import { z } from 'zod';

export const updateCategorySchema = z
  .object({
    name: z.string().optional(),
    parentId: z.uuid().optional(),
  })
  .refine((data) => data.name || data.parentId, {
    message: 'At least one field should be provided (name or parentId).',
    path: ['name', 'parentId'],
  });

export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
