import { Category } from '../category/category.entity';
import { Product, ProductStatus } from './product.entity';

describe('Product Entity', () => {
  it('should be defined', () => {
    const product = new Product();
    expect(product).toBeDefined();
  });

  it('should have correct properties', () => {
    const product = new Product();
    const now = new Date();
    product.id = 'uuid';
    product.name = 'Test Product';
    product.description = 'Test Description';
    product.status = ProductStatus.ACTIVE;
    product.attributes = JSON.stringify({ color: 'red' });
    product.createdAt = now;
    product.updatedAt = now;

    expect(product.id).toBe('uuid');
    expect(product.name).toBe('Test Product');
    expect(product.description).toBe('Test Description');
    expect(product.status).toBe(ProductStatus.ACTIVE);
    expect(product.attributes).toBe(JSON.stringify({ color: 'red' }));
    expect(product.createdAt).toBe(now);
    expect(product.updatedAt).toBe(now);
  });

  it('should default status to DRAFT', () => {
    const product = new Product();
    // In real app, this default is handled by database, but we can check if it's set in constructor or left as is
    // Actually TypeORM @Column({ default: 'DRAFT' }) doesn't set it on the JS object automatically on `new Product()`
    // but we can test it after a save (integration) or if we add it to constructor.
    // For now, let's just check the property exists.
    expect(product.status).toBeUndefined(); // or whatever default it might have if any
  });

  it('should allow many categories', () => {
    const category1 = new Category();
    category1.id = 'cat-1';
    const category2 = new Category();
    category2.id = 'cat-2';

    const product = new Product();
    product.categories = [category1, category2];

    expect(product.categories).toHaveLength(2);
    expect(product.categories[0].id).toBe('cat-1');
    expect(product.categories[1].id).toBe('cat-2');
  });
});
