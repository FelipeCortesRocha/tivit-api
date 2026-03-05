import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  find(where: Record<string, any>): Promise<Category> {
    return this.categoriesRepository.findOne({
      where,
      relations: {
        parent: true,
      },
    });
  }

  findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({
      relations: {
        parent: true,
      },
    });
  }

  findById(id: string): Promise<Category | null> {
    return this.categoriesRepository.findOne({
      where: { id },
      relations: {
        parent: true,
      },
    });
  }

  async create(category: Partial<Category>): Promise<Category> {
    return await this.categoriesRepository.save(category);
  }

  async update(category: Category): Promise<Category> {
    return await this.categoriesRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    await this.categoriesRepository.delete(id);
  }
}
