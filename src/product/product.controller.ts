import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import { ProductsRepository } from './product.repository';
import { Product } from './product.entity';
import { ZodValidationPipe } from 'src/common/pipes/ZodValidationPipe';
import * as createProductDto from './dtos/createProductDto';

@Controller()
export class ProductController {
  constructor(private readonly productsRepository: ProductsRepository) {}

  @Get('/products')
  async getProducts(): Promise<Product[]> {
    return await this.productsRepository.findAll();
  }

  @Post('/products')
  @UsePipes(new ZodValidationPipe(createProductDto.createProductSchema))
  async postProduct(
    @Body() newProduct: createProductDto.CreateProductDto,
  ): Promise<Product> {
    console.log(newProduct);

    const createdProduct = await this.productsRepository.create({
      ...newProduct,
      createdAt: new Date(),
    });

    console.log(createdProduct);

    return createdProduct;
  }
}
