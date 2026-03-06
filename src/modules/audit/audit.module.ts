import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auditepository } from './audit.repository';
import { Audit } from './audit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Audit])],
  providers: [Auditepository],
  exports: [TypeOrmModule, Auditepository],
})
export class AuditModule {}
