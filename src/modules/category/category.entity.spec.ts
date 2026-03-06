import { Category } from './category.entity';

describe('Category Entity', () => {
  it('should be defined', () => {
    const category = new Category();
    expect(category).toBeDefined();
  });

  it('should have correct properties', () => {
    const category = new Category();
    const now = new Date();
    category.id = 'uuid';
    category.name = 'Test Category';
    category.createdAt = now;
    category.updatedAt = now;

    expect(category.id).toBe('uuid');
    expect(category.name).toBe('Test Category');
    expect(category.createdAt).toBe(now);
    expect(category.updatedAt).toBe(now);
  });

  it('should allow parent category', () => {
    const parent = new Category();
    parent.id = 'parent-id';

    const category = new Category();
    category.parent = parent;

    expect(category.parent).toBe(parent);
    expect(category.parent.id).toBe('parent-id');
  });
});
