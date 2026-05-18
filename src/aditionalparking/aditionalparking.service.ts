import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAditionalparkingDto } from './dto/create-aditionalparking.dto';
import { UpdateAditionalparkingDto } from './dto/update-aditionalparking.dto';
import { Aditionalparking } from './entities/aditionalparking.entity';

@Injectable()
export class AditionalparkingService {
  constructor(
    @InjectRepository(Aditionalparking)
    private readonly aditionalparkingRepository: Repository<Aditionalparking>,
  ) {}

  async create(
    createAditionalparkingDto: CreateAditionalparkingDto,
  ): Promise<Aditionalparking> {
    const entity = this.aditionalparkingRepository.create(
      createAditionalparkingDto,
    );

    return this.aditionalparkingRepository.save(entity);
  }

  async findAll(): Promise<{ total: number; data: Aditionalparking[] }> {
    const [data, total] = await this.aditionalparkingRepository.findAndCount({
      order: { id: 'ASC' },
    });

    return { total, data };
  }

  async findOne(id: number): Promise<Aditionalparking> {
    const entity = await this.aditionalparkingRepository.findOneBy({ id });

    if (!entity) {
      throw new NotFoundException(`Aditionalparking ${id} not found`);
    }

    return entity;
  }

  async update(
    id: number,
    updateAditionalparkingDto: UpdateAditionalparkingDto,
  ): Promise<Aditionalparking> {
    await this.findOne(id);

    await this.aditionalparkingRepository.update(id, updateAditionalparkingDto);

    return this.findOne(id);
  }
}
