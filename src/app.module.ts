import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';
import { ConfigModule } from '@nestjs/config';
import { AuditModule } from './modules/audit/audit.module';
import { ProductSubscriber } from './subscribers/product.subscriber';
import { CategorySubscriber } from './subscribers/category.subscriber';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      synchronize: true, // TODO: Remove in production to avoid losing data
      autoLoadEntities: true,
      subscribers: [ProductSubscriber, CategorySubscriber],
    }),
    ProductModule,
    CategoryModule,
    AuditModule,
  ],
})
export class AppModule {}
