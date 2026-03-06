import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { Category } from './category.entity';
import { ZodValidationPipe } from 'src/common/pipes/ZodValidationPipe';
import * as createCategoryDto from './dtos/createCategoryDto';
import * as updateCategoryDto from './dtos/updateCategoryDto';
import { Not } from 'typeorm';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  @Get()
  async getCategories(): Promise<Category[]> {
    return await this.categoryRepository.findAll();
  }

  @Get('/:categoryId')
  async getCategory(
    @Param('categoryId') categoryId: string,
  ): Promise<Category> {
    return await this.categoryRepository.findById(categoryId);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createCategoryDto.createCategorySchema))
  async postCategory(
    @Body() newCategory: createCategoryDto.CreateCategoryDto,
  ): Promise<Category> {
    let parentCategory: Category | null = null;
    if (newCategory.parentId) {
      parentCategory = await this.categoryRepository.findById(
        newCategory.parentId,
      );

      if (!parentCategory) throw new BadRequestException('Parent not found');
    }

    const existingCategory = await this.categoryRepository.find({
      name: newCategory.name,
    });

    if (existingCategory.length > 0)
      throw new BadRequestException('Category name already exists');

    const createdCategory = await this.categoryRepository.save({
      ...newCategory,
      parent: parentCategory,
      createdAt: new Date(),
    });

    return createdCategory;
  }

  @Patch('/:categoryId')
  @UsePipes(new ZodValidationPipe(updateCategoryDto.updateCategorySchema))
  async updateCategory(
    @Body() categoryBody: updateCategoryDto.UpdateCategoryDto,
    @Param('categoryId') categoryId: string,
  ): Promise<Category> {
    if (categoryBody.parentId && categoryBody.parentId === categoryId) {
      throw new BadRequestException('A category cannot be its own parent');
    }

    if (categoryBody.name) {
      const existingCategory = await this.categoryRepository.find({
        id: Not(categoryId),
        name: categoryBody.name,
      });

      if (existingCategory.length > 0)
        throw new BadRequestException('Category name already exists');
    }

    let newParentCategory: Category | null = null;
    if (categoryBody.parentId !== '' && categoryBody.parentId) {
      newParentCategory = await this.categoryRepository.findById(
        categoryBody.parentId,
      );

      if (!newParentCategory) throw new BadRequestException('Parent not found');
    }

    const categoryToUpdate = await this.categoryRepository.findById(categoryId);

    const updatedCategory = await this.categoryRepository.save({
      ...categoryToUpdate,
      ...categoryBody,
      parent: categoryBody.parentId === '' ? null : newParentCategory,
      updatedAt: new Date(),
    });

    return updatedCategory;
  }

  @Delete('/:categoryId')
  @HttpCode(204)
  async deleteCategory(@Param('categoryId') categoryId: string) {
    const foundCategory = await this.categoryRepository.findById(categoryId);
    if (!foundCategory) throw new NotFoundException();

    await this.categoryRepository.remove(categoryId);
  }
}
