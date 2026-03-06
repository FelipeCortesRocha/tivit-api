import { Product } from '../product.entity';

export interface ProductResponseDto extends Omit<Product, 'attributes'> {
  attributes: any;
}
