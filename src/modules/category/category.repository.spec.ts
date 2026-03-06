import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryRepository } from './category.repository';
import { Category } from './category.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('CategoryRepository Integration', () => {
  let repository: CategoryRepository;
  let typeormRepository: Repository<Category>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Category],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Category]),
      ],
      providers: [CategoryRepository],
    }).compile();

    repository = module.get<CategoryRepository>(CategoryRepository);
    typeormRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    );
  });

  afterEach(async () => {
    await typeormRepository.clear();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should save and find a category', async () => {
    const categoryData: Partial<Category> = {
      name: 'Test Category',
      createdAt: new Date(),
    };

    const savedCategory = await repository.save(categoryData);
    expect(savedCategory.id).toBeDefined();
    expect(savedCategory.name).toBe('Test Category');

    const foundCategory = await repository.findById(savedCategory.id);
    expect(foundCategory).toBeDefined();
    expect(foundCategory?.name).toBe('Test Category');
  });

  it('should findAll categories', async () => {
    await repository.save({ name: 'Cat 1', createdAt: new Date() });
    await repository.save({ name: 'Cat 2', createdAt: new Date() });

    const categories = await repository.findAll();
    expect(categories).toHaveLength(2);
  });

  it('should find categories with where clause', async () => {
    await repository.save({ name: 'Cat 1', createdAt: new Date() });
    await repository.save({ name: 'Cat 2', createdAt: new Date() });

    const categories = await repository.find({ name: 'Cat 1' });
    expect(categories).toHaveLength(1);
    expect(categories[0].name).toBe('Cat 1');
  });

  it('should remove a category', async () => {
    const savedCategory = await repository.save({
      name: 'To Remove',
      createdAt: new Date(),
    });
    await repository.remove(savedCategory.id);

    const foundCategory = await repository.findById(savedCategory.id);
    expect(foundCategory).toBeNull();
  });

  it('should find category with parent relation', async () => {
    const parent = await repository.save({
      name: 'Parent',
      createdAt: new Date(),
    });
    const child = await repository.save({
      name: 'Child',
      parent,
      createdAt: new Date(),
    });

    const foundChild = await repository.findById(child.id);
    expect(foundChild?.parent).toBeDefined();
    expect(foundChild?.parent.id).toBe(parent.id);
  });
});
