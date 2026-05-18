import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { DataSource, DeepPartial, Repository } from 'typeorm';
import { Aditionalparking } from '../aditionalparking/entities/aditionalparking.entity';
import { Package } from '../packages/entities/package.entity';
import { Slot } from '../slots/entities/slot.entity';
import { CreateParkingDto } from './dto/create-parking.dto';
import { EndParkingDto } from './dto/end-parking.dto';
import { UpdateAdditionalPackageDto } from './dto/update-additional-package.dto';
import { UpdateParkingDto } from './dto/update-parking.dto';
import { EndParking } from './entities/end-parking.entity';
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

    @InjectRepository(EndParking)
    private readonly endParkingRepository: Repository<EndParking>,

    @InjectRepository(Slot)
    private readonly slotsRepository: Repository<Slot>,

    @InjectRepository(Package)
    private readonly packagesRepository: Repository<Package>,

    @InjectRepository(Aditionalparking)
    private readonly aditionalparkingRepository: Repository<Aditionalparking>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createParkingDto: CreateParkingDto): Promise<ParkingDetails> {
    await this.validateSlot(createParkingDto.slotId);
    await this.validateFeePackage(createParkingDto.feePackageId);

    const feePackage = await this.packagesRepository.findOneBy({
      id: createParkingDto.feePackageId,
    });

    if (!feePackage) {
      throw new NotFoundException(
        `Package ${createParkingDto.feePackageId} not found`,
      );
    }

    const parkedTime = new Date(createParkingDto.parkedTime);

    const baseHours = this.parsePackageHours(feePackage.timeDuration) || 0;

    const parkEndTime = new Date(
      parkedTime.getTime() + baseHours * 60 * 60 * 1000,
    );

    const parking = this.parkingRepository.create({
      ...createParkingDto,
      token: await this.generateUniqueParkingToken(createParkingDto),
      parkEndTime,
    });

    const savedParking = await this.parkingRepository.save(parking);

    return this.findOne(savedParking.id);
  }

  async findAll(): Promise<{ total: number; data: ParkingDetails[] }> {
    const [data, total] = await this.parkingRepository.findAndCount({
      order: { id: 'ASC' },
      relations: {
        feePackage: true,
        additionalFeePackage: true,
        parkingSlot: true,
      },
      where: { end: false },
    });

    return {
      total,
      data: data.map((parking) => this.toParkingDetails(parking)),
    };
  }

  async findOne(id: number): Promise<ParkingDetails> {
    const parking = await this.parkingRepository.findOne({
      relations: {
        feePackage: true,
        additionalFeePackage: true,
        parkingSlot: true,
      },
      where: { id, end: false },
    });

    if (!parking) {
      throw new NotFoundException(`Parking ${id} not found`);
    }

    return this.toParkingDetails(parking);
  }

  async findOneByToken(token: string): Promise<ParkingDetails> {
    const parking = await this.parkingRepository.findOne({
      relations: {
        feePackage: true,
        additionalFeePackage: true,
        parkingSlot: true,
      },
      where: { token, end: false },
    });

    if (!parking) {
      throw new NotFoundException('Parking not found for provided token');
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

    const updateData: any = {
      ...updateParkingDto,
    };

    if (updateParkingDto.ongoing !== undefined) {
      if (updateParkingDto.ongoing === true) {
        updateData.end = false;
      } else {
        updateData.end = true;
        updateData.parkEndTime = new Date();
      }

      delete updateData.ongoing;
    }

    await this.parkingRepository.update(id, updateData);

    return this.findOne(id);
  }

  async updateAdditionalPackage(
    id: number,
    updateAdditionalPackageDto: UpdateAdditionalPackageDto,
  ): Promise<ParkingDetails> {
    await this.findOne(id);

    if (!updateAdditionalPackageDto.additionalFeePackageId) {
      throw new NotFoundException('Additional package id required');
    }

    const additionalFeePackage =
      await this.aditionalparkingRepository.findOneBy({
        id: Number(updateAdditionalPackageDto.additionalFeePackageId),
      });

    if (!additionalFeePackage) {
      throw new NotFoundException(
        `Package ${updateAdditionalPackageDto.additionalFeePackageId} not found`,
      );
    }

    const parking = await this.parkingRepository.findOne({
      relations: {
        feePackage: true,
        additionalFeePackage: true,
      },
      where: { id, end: false },
    });

    if (!parking) {
      throw new NotFoundException(`Parking ${id} not found`);
    }

    const currentEndTime = parking.parkEndTime
      ? new Date(parking.parkEndTime)
      : new Date();

    const additionalHours = additionalFeePackage.hours || 0;

    const updatedEndTime = new Date(
      currentEndTime.getTime() + additionalHours * 60 * 60 * 1000,
    );

    await this.parkingRepository.update(id, {
      additionalFeePackageId: additionalFeePackage.id,
      parkEndTime: updatedEndTime,
    });

    return this.findOne(id);
  }

  async remove(id: number): Promise<{ deleted: true }> {
    await this.findOne(id);

    await this.parkingRepository.delete(id);

    return { deleted: true };
  }

  async findEnded(): Promise<{
    total: number;
    data: EndParking[];
  }> {
    const [data, total] = await this.endParkingRepository.findAndCount({
      order: { id: 'DESC' },
      relations: {
        additionalFeePackage: true,
        feePackage: true,
        parkingSlot: true,
      },
    });

    return { total, data };
  }

  async findEndedByParkingId(parkingId: number): Promise<EndParking> {
    const endedParking = await this.endParkingRepository.findOne({
      relations: {
        additionalFeePackage: true,
        feePackage: true,
        parkingSlot: true,
      },
      where: {
        parkingId,
        end: true,
      },
    });

    if (!endedParking) {
      throw new NotFoundException(
        `Ended parking record for parking ${parkingId} not found`,
      );
    }

    return endedParking;
  }

  async endParking(
    id: number,
    endParkingDto: EndParkingDto,
  ): Promise<EndParking> {
    const parking = await this.parkingRepository.findOne({
      relations: {
        feePackage: true,
        parkingSlot: true,
      },
      where: { id, end: false },
    });

    if (!parking) {
      throw new NotFoundException(`Active parking ${id} not found`);
    }

    const additionalFeePackage =
      endParkingDto.additionalFeePackageId === undefined
        ? undefined
        : await this.aditionalparkingRepository.findOneBy({
            id: endParkingDto.additionalFeePackageId,
          });

    if (
      endParkingDto.additionalFeePackageId !== undefined &&
      !additionalFeePackage
    ) {
      throw new NotFoundException(
        `Package ${endParkingDto.additionalFeePackageId} not found`,
      );
    }

    const parkEndTime = new Date();

    const baseFees = this.calculatePackageFees(parking.feePackage);

    const additionalFees = additionalFeePackage
      ? this.calculateAditionalparkingFees(additionalFeePackage)
      : 0;

    const fullFees = Number((baseFees + additionalFees).toFixed(2));

    return this.dataSource.transaction<EndParking>(async (manager) => {
      const endedParkingData: DeepPartial<EndParking> = {
        end: true,
        feePackage: parking.feePackage,
        feePackageId: parking.feePackageId,
        fullFees,
        parkedTime: parking.parkedTime,
        parkingId: parking.id,
        parkingSlot: parking.parkingSlot,
        parkEndTime,
        slotId: parking.slotId,
        token: parking.token,
        vehicleNumber: parking.vehicleNumber,
        vehicleOwnerName: parking.vehicleOwnerName,
        vehicleOwnerTelephone: parking.vehicleOwnerTelephone,
      };

      if (additionalFeePackage) {
        endedParkingData.additionalFeePackage = additionalFeePackage;

        endedParkingData.additionalFeePackageId = additionalFeePackage.id;
      }

      const endedParking = manager
        .getRepository(EndParking)
        .create(endedParkingData);

      const savedEndedParking = await manager
        .getRepository(EndParking)
        .save(endedParking);

      await manager.getRepository(Parking).update(id, {
        end: true,
        parkEndTime,
      });

      return savedEndedParking;
    });
  }

  private async validateSlot(slotId: number): Promise<void> {
    const slot = await this.slotsRepository.findOneBy({
      id: slotId,
    });

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

  private async generateUniqueParkingToken(
    createParkingDto: CreateParkingDto,
  ): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const token = this.buildParkingToken(createParkingDto);

      const existingParking = await this.parkingRepository.findOne({
        select: { id: true },
        where: { token },
      });

      if (!existingParking) {
        return token;
      }
    }

    return this.buildParkingToken(createParkingDto);
  }

  private buildParkingToken(createParkingDto: CreateParkingDto): string {
    const vehiclePart =
      createParkingDto.vehicleNumber
        .replace(/[^a-z0-9]/gi, '')
        .toUpperCase()
        .slice(-7) || 'VEHICLE';

    const parkedDate =
      createParkingDto.parkedTime instanceof Date
        ? createParkingDto.parkedTime
        : new Date(createParkingDto.parkedTime);

    const timePart = parkedDate.getTime().toString(36).toUpperCase();

    const randomPart = randomBytes(3).toString('hex').toUpperCase();

    return `PRK-${vehiclePart}-${timePart}-${randomPart}`;
  }

  private toParkingDetails(parking: Parking): ParkingDetails {
    const baseFees = this.calculatePackageFees(parking.feePackage);

    const additionalFees = parking.additionalFeePackage
      ? this.calculateAditionalparkingFees(parking.additionalFeePackage)
      : 0;

    const fullFees = Number((baseFees + additionalFees).toFixed(2));

    return {
      ...parking,
      fullFees,
      ongoing: !parking.end,
    };
  }

  private calculatePackageFees(feePackage: Package): number {
    const packagePrice = feePackage.packagePrice;

    const offer = feePackage.offer;

    return Number((packagePrice - packagePrice * (offer / 100)).toFixed(2));
  }

  private calculateAditionalparkingFees(additional: Aditionalparking): number {
    const fee = additional.fee;

    const discount = additional.discount;

    return Number((fee - fee * (discount / 100)).toFixed(2));
  }

  private parsePackageHours(timeDuration: string): number | null {
    const match = timeDuration.match(/(\d+(?:\.\d+)?)/);

    if (!match) {
      return null;
    }

    const value = Number(match[1]);

    return Number.isFinite(value) && value > 0 ? value : null;
  }
}
