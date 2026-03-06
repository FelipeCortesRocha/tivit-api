import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Audit } from './audit.entity';
import { Repository } from 'typeorm';

@Injectable()
export class Auditepository {
  constructor(
    @InjectRepository(Audit)
    private auditRepository: Repository<Audit>,
  ) {}

  find(where: Record<string, any>): Promise<Audit[]> {
    return this.auditRepository.find({
      where,
    });
  }

  findAll(): Promise<Audit[]> {
    return this.auditRepository.find();
  }

  findById(id: string): Promise<Audit | null> {
    return this.auditRepository.findOneBy({ id });
  }

  async save(audit: Partial<Audit>): Promise<Audit> {
    return await this.auditRepository.save(audit);
  }

  async remove(id: string): Promise<void> {
    await this.auditRepository.delete(id);
  }
}
