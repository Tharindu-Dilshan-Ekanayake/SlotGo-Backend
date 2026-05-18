import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from '../packages/entities/package.entity';
import { Slot } from '../slots/entities/slot.entity';
import { CreateParkingDto } from './dto/create-parking.dto';
import { UpdateParkingDto } from './dto/update-parking.dto';
import { Parking } from './entities/parking.entity';

export type ParkingDetails = Parking & {
  fullFees: number;
  ongoing: boolean;
};

@Injectable()
export class ParkingService {
  constructor(
    @InjectRepository(Parking)
    private readonly parkingRepository: Repository<Parking>,
    @InjectRepository(Slot)
    private readonly slotsRepository: Repository<Slot>,
    @InjectRepository(Package)
    private readonly packagesRepository: Repository<Package>,
  ) {}

  async create(createParkingDto: CreateParkingDto): Promise<Parking> {
    await this.validateSlot(createParkingDto.slotId);
    await this.validateFeePackage(createParkingDto.feePackageId);

    const parking = this.parkingRepository.create(createParkingDto);

    return this.parkingRepository.save(parking);
  }

  async findAll(): Promise<{ total: number; data: ParkingDetails[] }> {
    const [data, total] = await this.parkingRepository.findAndCount({
      order: { id: 'ASC' },
      relations: { feePackage: true, parkingSlot: true },
    });

    return {
      total,
      data: data.map((parking) => this.toParkingDetails(parking)),
    };
  }

  async findOne(id: number): Promise<ParkingDetails> {
    const parking = await this.parkingRepository.findOne({
      relations: { feePackage: true, parkingSlot: true },
      where: { id },
    });

    if (!parking) {
      throw new NotFoundException(`Parking ${id} not found`);
    }

    return this.toParkingDetails(parking);
  }

  async update(
    id: number,
    updateParkingDto: UpdateParkingDto,
  ): Promise<ParkingDetails> {
    await this.findOne(id);

    if (updateParkingDto.slotId !== undefined) {
      await this.validateSlot(updateParkingDto.slotId);
    }

    if (updateParkingDto.feePackageId !== undefined) {
      await this.validateFeePackage(updateParkingDto.feePackageId);
    }

    await this.parkingRepository.update(id, updateParkingDto);

    return this.findOne(id);
  }

  async remove(id: number): Promise<{ deleted: true }> {
    await this.findOne(id);
    await this.parkingRepository.delete(id);

    return { deleted: true };
  }

  private async validateSlot(slotId: number): Promise<void> {
    const slot = await this.slotsRepository.findOneBy({ id: slotId });

    if (!slot) {
      throw new NotFoundException(`Slot ${slotId} not found`);
    }
  }

  private async validateFeePackage(feePackageId: number): Promise<void> {
    const feePackage = await this.packagesRepository.findOneBy({
      id: feePackageId,
    });

    if (!feePackage) {
      throw new NotFoundException(`Package ${feePackageId} not found`);
    }
  }

  private toParkingDetails(parking: Parking): ParkingDetails {
    const packagePrice = parking.feePackage.packagePrice;
    const offer = parking.feePackage.offer;
    const fullFees = Number(
      (packagePrice - packagePrice * (offer / 100)).toFixed(2),
    );

    return {
      ...parking,
      fullFees,
      ongoing:
        parking.parkEndTime === undefined || parking.parkEndTime === null,
    };
  }
}
