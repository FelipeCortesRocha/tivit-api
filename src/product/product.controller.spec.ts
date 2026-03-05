import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductsRepository } from './product.repository';

describe('ProductController', () => {
  let productModule: TestingModule;

  beforeAll(async () => {
    productModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [ProductsRepository],
    }).compile();
  });

  describe('getProducts', () => {
    it('should return the products', () => {
      const productController = productModule.get(ProductController);
      expect(productController.getProducts()).toBe([]);
    });
  });
});
