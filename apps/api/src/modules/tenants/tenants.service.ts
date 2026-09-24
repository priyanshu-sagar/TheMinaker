import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantEntity } from './tenant.entity';
import { TenantStatus, TenantPlan } from '@minaker/shared-types';

export interface CreateTenantDto {
  name: string;
  slug: string;
  plan?: TenantPlan;
}

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly repo: Repository<TenantEntity>,
  ) {}

  async findAll(): Promise<TenantEntity[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<TenantEntity> {
    const tenant = await this.repo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException(`Tenant ${id} not found`);
    return tenant;
  }

  async create(dto: CreateTenantDto): Promise<TenantEntity> {
    const existing = await this.repo.findOne({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException(`Slug '${dto.slug}' is already taken`);
    const tenant = this.repo.create({
      ...dto,
      status: TenantStatus.TRIAL,
    });
    return this.repo.save(tenant);
  }

  async suspend(id: string): Promise<void> {
    await this.findById(id);
    await this.repo.update({ id }, { status: TenantStatus.SUSPENDED });
  }

  async activate(id: string): Promise<void> {
    await this.findById(id);
    await this.repo.update({ id }, { status: TenantStatus.ACTIVE });
  }
}
