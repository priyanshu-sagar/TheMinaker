import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolEntity } from './school.entity';

@Injectable()
export class SchoolsService {
  constructor(
    @InjectRepository(SchoolEntity)
    private readonly repo: Repository<SchoolEntity>,
  ) {}

  async findById(tenantId: string): Promise<SchoolEntity> {
    const school = await this.repo.findOne({ where: { id: tenantId } });
    if (!school) throw new NotFoundException('School not found');
    return school;
  }

  async updateSettings(
    tenantId: string,
    settings: Record<string, unknown>,
  ): Promise<SchoolEntity> {
    const school = await this.findById(tenantId);
    school.settings = { ...school.settings, ...settings };
    return this.repo.save(school);
  }

  async updateLogoUrl(tenantId: string, logoUrl: string): Promise<void> {
    await this.repo.update({ id: tenantId }, { logoUrl });
  }
}
