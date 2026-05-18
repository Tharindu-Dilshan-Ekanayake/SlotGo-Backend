import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { Package } from './entities/package.entity';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private readonly packagesRepository: Repository<Package>,
  ) {}

  async create(createPackageDto: CreatePackageDto): Promise<Package> {
    const packageEntity = this.packagesRepository.create(createPackageDto);

    return this.packagesRepository.save(packageEntity);
  }

  async findAll(): Promise<{ total: number; data: Package[] }> {
    const [data, total] = await this.packagesRepository.findAndCount({
      order: { id: 'ASC' },
    });

    return { total, data };
  }

  async findOne(id: number): Promise<Package> {
    const packageEntity = await this.packagesRepository.findOneBy({ id });

    if (!packageEntity) {
      throw new NotFoundException(`Package ${id} not found`);
    }

    return packageEntity;
  }

  async update(
    id: number,
    updatePackageDto: UpdatePackageDto,
  ): Promise<Package> {
    await this.findOne(id);

    await this.packagesRepository.update(id, updatePackageDto);

    return this.findOne(id);
  }

  async remove(id: number): Promise<{ deleted: true }> {
    await this.findOne(id);
    await this.packagesRepository.delete(id);

    return { deleted: true };
  }
}
