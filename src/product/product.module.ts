import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsRepository } from './product.repository';
import { ProductController } from './product.controller';
import { Product } from './product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductsRepository],
  controllers: [ProductController],
  exports: [TypeOrmModule, ProductsRepository],
})
export class ProductModule {}
