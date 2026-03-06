/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { Product, ProductStatus } from './product.entity';
import { ZodValidationPipe } from 'src/common/pipes/ZodValidationPipe';
import * as createProductDto from './dtos/createProductDto';
import * as updateProductDto from './dtos/updateProductDto';
import { CategoryRepository } from '../category/category.repository';
import { In, Not } from 'typeorm';
import { ProductResponseDto } from './dtos/productResponseDto';
import { Category } from '../category/category.entity';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productsRepository: ProductRepository,
    private readonly categoriesRepository: CategoryRepository,
  ) {}

  attributeStringToObject(string: string): Record<string, string> {
    if (string.includes('{'))
      return JSON.parse(string) as Record<string, string>;

    return string.split(',').reduce((newAttributes, currentAttribute) => {
      const [key, value] = currentAttribute.split(':');

      newAttributes[key.trim()] = value.trim();

      return newAttributes;
    }, {});
  }

  @Get()
  async getProducts(): Promise<ProductResponseDto[]> {
    const products = await this.productsRepository.findAll();

    console.log(products);
    return products.map((product: Product) => ({
      ...product,
      attributes: this.attributeStringToObject(product.attributes),
    }));
  }

  @Get('/:productId')
  async getProduct(
    @Param('productId') productId: string,
  ): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findById(productId);
    return {
      ...product,
      attributes: this.attributeStringToObject(product.attributes),
    };
  }

  @Post('')
  @UsePipes(new ZodValidationPipe(createProductDto.createProductSchema))
  async postProduct(
    @Body() postProductBody: createProductDto.CreateProductDto,
  ): Promise<ProductResponseDto> {
    const newProduct: Partial<Product> = {
      ...postProductBody,
      createdAt: new Date(),
      categories: [],
    };

    if (postProductBody.categories) {
      try {
        const categories = await this.categoriesRepository.find({
          id: In(postProductBody.categories),
        });

        newProduct.categories = categories;
      } catch (error) {
        throw new InternalServerErrorException(
          `Unable to get categories ${error}`,
        );
      }
    }

    if (postProductBody.attributes) {
      newProduct.attributes = JSON.stringify(
        this.attributeStringToObject(postProductBody.attributes),
      );
    }

    const createdProduct = await this.productsRepository.save(newProduct);

    return {
      ...createdProduct,
      attributes: createdProduct.attributes
        ? JSON.parse(createdProduct.attributes)
        : {},
    };
  }

  @Patch('/:productId')
  @UsePipes(new ZodValidationPipe(updateProductDto.updateProductSchema))
  async updateCategory(
    @Body() patchProductBody: updateProductDto.UptadeProductDto,
    @Param('productId') productId: string,
  ): Promise<ProductResponseDto> {
    const productToUpdate = await this.productsRepository.findById(productId);

    if (!productToUpdate) throw new NotFoundException('Product not found');

    if (
      productToUpdate.status === ProductStatus.ARCHIVED &&
      patchProductBody.status === ProductStatus.ACTIVE
    )
      throw new BadRequestException(
        'ARCHIVED products can only change the description',
      );

    if (
      productToUpdate.status !== ProductStatus.ARCHIVED &&
      patchProductBody.status !== ProductStatus.ARCHIVED
    ) {
      const {
        attributesToAdd,
        attributesToRemove,
        categoriesToAdd,
        categoriesToRemove,
      } = patchProductBody;

      const productAttributes = productToUpdate.attributes
        ? JSON.parse(productToUpdate.attributes)
        : {};

      if (attributesToAdd) {
        for (const [key, value] of Object.entries(
          this.attributeStringToObject(attributesToAdd),
        )) {
          productAttributes[key] = value;
        }
      }

      if (attributesToRemove) {
        attributesToRemove.split(',').forEach((key: string) => {
          delete productAttributes[key.trim()];
        });
      }

      productToUpdate.attributes = JSON.stringify(productAttributes);

      if (categoriesToRemove && categoriesToRemove.length > 0) {
        categoriesToRemove.forEach((categoryId: string) => {
          const index = categoriesToAdd.indexOf(categoryId);
          if (index !== -1) {
            categoriesToAdd.splice(index, 1);
          }

          const indexInExistingCategories =
            productToUpdate.categories.findIndex(
              (category: Category) => category.id === categoryId,
            );

          if (indexInExistingCategories !== -1) {
            productToUpdate.categories.splice(indexInExistingCategories, 1);
          }
        });
      }

      if (categoriesToAdd && categoriesToAdd.length > 0) {
        const filteredCategoriesToAdd = categoriesToAdd.filter(
          (categoryId: string) => {
            const indexInExistingCategories =
              productToUpdate.categories.findIndex(
                (category: Category) => category.id === categoryId,
              );

            if (indexInExistingCategories === -1) return true;

            return false;
          },
        );

        try {
          const categories = await this.categoriesRepository.find({
            id: In(filteredCategoriesToAdd),
          });

          productToUpdate.categories = [
            ...productToUpdate.categories,
            ...categories,
          ];
        } catch (error) {
          throw new InternalServerErrorException(
            `Unable to get categories ${error}`,
          );
        }
      }

      if (patchProductBody.name) productToUpdate.name = patchProductBody.name;
      if (patchProductBody.status) {
        if (patchProductBody.status === ProductStatus.ACTIVE) {
          if (
            productToUpdate.categories.length === 0 ||
            Object.keys(productAttributes).length === 0
          )
            throw new BadRequestException(
              'Products can only be set to ACTIVE having at least one category and one attribute',
            );

          const activeProductWithSameName = await this.productsRepository.find({
            id: Not(productToUpdate.id),
            name: productToUpdate.name,
            status: 'ACTIVE',
          });

          if (activeProductWithSameName.length > 0)
            throw new BadRequestException(
              'Already exist an ACTIVE product with same name',
            );
        }
      }
    }

    if (patchProductBody.status === ProductStatus.ARCHIVED)
      productToUpdate.status = patchProductBody.status;
    if (patchProductBody.description)
      productToUpdate.description = patchProductBody.description;

    const updatedProduct = await this.productsRepository.save({
      ...productToUpdate,
      updatedAt: new Date(),
    });

    return {
      ...updatedProduct,
      attributes: JSON.parse(updatedProduct.attributes),
    };
  }
}
