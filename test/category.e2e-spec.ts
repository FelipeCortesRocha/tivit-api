/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../src/modules/category/category.entity';
import { CategoryModule } from '../src/modules/category/category.module';

describe('Category (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Category],
          synchronize: true,
        }),
        CategoryModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/categories (GET)', async () => {
    return request(app.getHttpServer())
      .get('/categories')
      .expect(200)
      .expect([]);
  });

  it('/categories/:id (GET)', async () => {
    const createDto = { name: 'Get By Id' };
    const postResponse = await request(app.getHttpServer())
      .post('/categories')
      .send(createDto)
      .expect(201);

    const categoryId = postResponse.body.id;

    const getResponse = await request(app.getHttpServer())
      .get(`/categories/${categoryId}`)
      .expect(200);

    expect(getResponse.body.name).toBe(createDto.name);

    await request(app.getHttpServer()).get(`/categories/123`).expect(404);
  });

  it('/categories (POST) - create category', async () => {
    const createDto = { name: 'Test Category' };
    const response = await request(app.getHttpServer())
      .post('/categories')
      .send(createDto)
      .expect(201);

    expect(response.body.name).toBe(createDto.name);
    expect(response.body.id).toBeDefined();
    return response;
  });

  it('/categories (POST) - fail duplication', async () => {
    const createDto = { name: 'Duplicate Category' };
    await request(app.getHttpServer())
      .post('/categories')
      .send(createDto)
      .expect(201);

    return request(app.getHttpServer())
      .post('/categories')
      .send(createDto)
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain('Category name already exists');
      });
  });

  it('/categories/:id (PATCH)', async () => {
    const createDto = { name: 'Original Name' };
    const postResponse = await request(app.getHttpServer())
      .post('/categories')
      .send(createDto)
      .expect(201);

    const categoryId = postResponse.body.id;
    const patchDto = { name: 'Updated Name' };

    const patchResponse = await request(app.getHttpServer())
      .patch(`/categories/${categoryId}`)
      .send(patchDto)
      .expect(200);

    expect(patchResponse.body.name).toBe(patchDto.name);
  });
});
