import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum Actions {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
}

@Entity()
export class Audit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  timestamp: Date;

  @Column()
  action: Actions;

  @Column({ nullable: true })
  oldRecord: string;

  @Column()
  newRecord: string;

  @Column()
  entity: string;
}
