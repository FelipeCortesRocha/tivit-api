import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  find(where: Record<string, any>): Promise<Product[]> {
    return this.productsRepository.find({
      where,
      relations: ['categories', 'categories.parent'],
    });
  }

  findAll(): Promise<Product[]> {
    return this.productsRepository.find({
      relations: ['categories', 'categories.parent'],
    });
  }

  findById(id: string): Promise<Product | null> {
    return this.productsRepository.findOne({
      where: { id },
      relations: ['categories', 'categories.parent'],
    });
  }

  async save(product: Partial<Product>): Promise<Product> {
    return await this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    await this.productsRepository.delete(id);
  }
}
