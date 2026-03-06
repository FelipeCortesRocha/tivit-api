import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string(),
  parentId: z.uuid().optional(),
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
