/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductStatus } from '../src/modules/product/product.entity';
import { Category } from '../src/modules/category/category.entity';
import { CategoryModule } from '../src/modules/category/category.module';
import { ProductModule } from '../src/modules/product/product.module';

describe('Product (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Product, Category],
          synchronize: true,
        }),
        CategoryModule,
        ProductModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/products (GET)', async () => {
    return request(app.getHttpServer()).get('/products').expect(200).expect([]);
  });

  it('/products (POST) - create product', async () => {
    const createDto = {
      name: 'Test Product',
      description: 'Test Description',
      attributes: 'color:red,size:large',
    };
    const response = await request(app.getHttpServer())
      .post('/products')
      .send(createDto)
      .expect(201);

    expect(response.body.name).toBe(createDto.name);
    expect(response.body.attributes).toEqual({ color: 'red', size: 'large' });
    expect(response.body.status).toBe(ProductStatus.DRAFT);
  });

  it('/products (POST) - with categories', async () => {
    const catRes = await request(app.getHttpServer())
      .post('/categories')
      .send({ name: 'Cat 1' })
      .expect(201);

    const categoryId = catRes.body.id;

    const createDto = {
      name: 'Product with Category',
      categories: [categoryId],
    };

    const response = await request(app.getHttpServer())
      .post('/products')
      .send(createDto)
      .expect(201);

    expect(response.body.categories).toHaveLength(1);
    expect(response.body.categories[0].id).toBe(categoryId);
  });

  it('/products/:id (PATCH) - update attributes', async () => {
    const createDto = {
      name: 'To Update',
      attributes: 'color:blue',
    };
    const postRes = await request(app.getHttpServer())
      .post('/products')
      .send(createDto)
      .expect(201);

    const productId = postRes.body.id;

    const patchDto = {
      attributesToAdd: 'size:small',
      attributesToRemove: 'color',
    };

    const patchRes = await request(app.getHttpServer())
      .patch(`/products/${productId}`)
      .send(patchDto)
      .expect(200);

    expect(patchRes.body.attributes).toEqual({ size: 'small' });
    expect(patchRes.body.attributes.color).toBeUndefined();
  });

  it('/products/:id (PATCH) - set ACTIVE should fail if no categories or attributes', async () => {
    const postRes = await request(app.getHttpServer())
      .post('/products')
      .send({ name: 'Draft Product' })
      .expect(201);

    const productId = postRes.body.id;

    await request(app.getHttpServer())
      .patch(`/products/${productId}`)
      .send({ status: ProductStatus.ACTIVE })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain(
          'Products can only be set to ACTIVE having at least one category and one attribute',
        );
      });
  });

  it('/products/:id (PATCH) - set ACTIVE success', async () => {
    const catRes = await request(app.getHttpServer())
      .post('/categories')
      .send({ name: 'Active Cat' })
      .expect(201);

    const postRes = await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Soon Active',
        attributes: 'foo:bar',
        categories: [catRes.body.id],
      })
      .expect(201);

    const productId = postRes.body.id;

    await request(app.getHttpServer())
      .patch(`/products/${productId}`)
      .send({ status: ProductStatus.ACTIVE })
      .expect(200);
  });

  it('/products/:id (PATCH) - ARCHIVED products can only change description', async () => {
    // Create archived product
    const postRes = await request(app.getHttpServer())
      .post('/products')
      .send({ name: 'Archived Prod', status: ProductStatus.ARCHIVED })
      .expect(201);

    const productId = postRes.body.id;

    await request(app.getHttpServer())
      .patch(`/products/${productId}`)
      .send({ status: ProductStatus.ACTIVE })
      .expect(400);

    const patchRes = await request(app.getHttpServer())
      .patch(`/products/${productId}`)
      .send({ description: 'New description' })
      .expect(200);

    expect(patchRes.body.description).toBe('New description');
  });
});
