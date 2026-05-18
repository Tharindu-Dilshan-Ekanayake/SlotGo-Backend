import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { Slot } from './entities/slot.entity';

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(Slot)
    private readonly slotsRepository: Repository<Slot>,
  ) {}

  async create(createSlotDto: CreateSlotDto): Promise<Slot> {
    const slot = this.slotsRepository.create(createSlotDto);

    return this.slotsRepository.save(slot);
  }

  async findAll(): Promise<{ total: number; data: Slot[] }> {
    const [data, total] = await this.slotsRepository.findAndCount({
      order: { id: 'ASC' },
    });

    return { total, data };
  }

  async findOne(id: number): Promise<Slot> {
    const slot = await this.slotsRepository.findOneBy({ id });

    if (!slot) {
      throw new NotFoundException(`Slot ${id} not found`);
    }

    return slot;
  }

  async update(id: number, updateSlotDto: UpdateSlotDto): Promise<Slot> {
    await this.findOne(id);

    await this.slotsRepository.update(id, updateSlotDto);

    return this.findOne(id);
  }

  async remove(id: number): Promise<{ deleted: true }> {
    await this.findOne(id);
    await this.slotsRepository.delete(id);

    return { deleted: true };
  }
}
