import { Category } from 'src/category/category.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'DRAFT' })
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

  @OneToMany(() => Category, (category) => category.id, { nullable: true })
  categories: Category[];

  @Column()
  attributes: string;

  @Column()
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}
