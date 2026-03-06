import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductRepository } from './product.repository';
import { Product, ProductStatus } from './product.entity';
import { Category } from '../category/category.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ProductRepository Integration', () => {
  let repository: ProductRepository;
  let productTypeOrmRepository: Repository<Product>;
  let categoryTypeOrmRepository: Repository<Category>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Product, Category],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Product, Category]),
      ],
      providers: [ProductRepository],
    }).compile();

    repository = module.get<ProductRepository>(ProductRepository);
    productTypeOrmRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    categoryTypeOrmRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    );
  });

  afterEach(async () => {
    await productTypeOrmRepository.clear();
    await categoryTypeOrmRepository.clear();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should save and find a product', async () => {
    const productData: Partial<Product> = {
      name: 'Test Product',
      status: ProductStatus.DRAFT,
      createdAt: new Date(),
      attributes: JSON.stringify({ key: 'value' }),
    };

    const savedProduct = await repository.save(productData);
    expect(savedProduct.id).toBeDefined();

    const foundProduct = await repository.findById(savedProduct.id);
    expect(foundProduct).toBeDefined();
    expect(foundProduct?.name).toBe('Test Product');
    expect(foundProduct?.status).toBe(ProductStatus.DRAFT);
  });

  it('should findAll products with relations', async () => {
    const cat = await categoryTypeOrmRepository.save({
      name: 'Cat',
      createdAt: new Date(),
    });

    await repository.save({
      name: 'Prod 1',
      createdAt: new Date(),
      categories: [cat],
    });

    const products = await repository.findAll();
    expect(products).toHaveLength(1);
    expect(products[0].categories).toHaveLength(1);
    expect(products[0].categories[0].name).toBe('Cat');
  });

  it('should remove a product', async () => {
    const savedProduct = await repository.save({
      name: 'To Remove',
      createdAt: new Date(),
    });
    await repository.remove(savedProduct.id);

    const foundProduct = await repository.findById(savedProduct.id);
    expect(foundProduct).toBeNull();
  });
});
