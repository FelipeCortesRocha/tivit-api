import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductRepository } from './product.repository';
import { ProductController } from './product.controller';
import { Product } from './product.entity';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), CategoryModule],
  providers: [ProductRepository],
  controllers: [ProductController],
  exports: [TypeOrmModule, ProductRepository],
})
export class ProductModule {}
