import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Category, { nullable: true })
  parent: Category;

  @Column()
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}
