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

    const parking = this.parkingRepository.create({
      ...createParkingDto,
      token: await this.generateUniqueParkingToken(createParkingDto),
      expectedEndTime: this.calculateExpectedEndTime(
        createParkingDto.parkedTime,
        feePackage,
        undefined,
      ),
    });
    const savedParking = await this.parkingRepository.save(parking);

    return this.findOne(savedParking.id);
  }

  async findAll(): Promise<{ total: number; data: ParkingDetails[] }> {
    const [data, total] = await this.parkingRepository.findAndCount({
      order: { id: 'ASC' },
      relations: { feePackage: true, additionalFeePackage: true, parkingSlot: true },
      where: { end: false },
    });

    return {
      total,
      data: data.map((parking) => this.toParkingDetails(parking)),
    };
  }

  async findOne(id: number): Promise<ParkingDetails> {
    const parking = await this.parkingRepository.findOne({
      relations: { feePackage: true, additionalFeePackage: true, parkingSlot: true },
      where: { id, end: false },
    });

    if (!parking) {
      throw new NotFoundException(`Parking ${id} not found`);
    }

    return this.toParkingDetails(parking);
  }

  async findOneByToken(token: string): Promise<ParkingDetails> {
    const parking = await this.parkingRepository.findOne({
      relations: { feePackage: true, additionalFeePackage: true, parkingSlot: true },
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

    // Handle ongoing status update
    const updateData: any = { ...updateParkingDto };
    if (updateParkingDto.ongoing !== undefined) {
      if (updateParkingDto.ongoing === true) {
        // Mark as ongoing: clear the end time
        updateData.parkEndTime = null;
        updateData.end = false;
      } else if (updateParkingDto.ongoing === false) {
        // Mark as ended: set the end time to now
        updateData.parkEndTime = new Date();
        updateData.end = true;
      }
      // Remove the ongoing field as it's not a database column
      delete updateData.ongoing;
    }

    await this.parkingRepository.update(id, updateData);

    // Recalculate expected end time when parked time / base package changes
    if (
      updateParkingDto.parkedTime !== undefined ||
      updateParkingDto.feePackageId !== undefined
    ) {
      const parking = await this.parkingRepository.findOne({
        relations: {
          feePackage: true,
          additionalFeePackage: true,
        },
        where: { id, end: false },
      });

      if (parking) {
        await this.parkingRepository.update(id, {
          expectedEndTime: this.calculateExpectedEndTime(
            parking.parkedTime,
            parking.feePackage,
            parking.additionalFeePackage,
          ),
        });
      }
    }

    return this.findOne(id);
  }

  async updateAdditionalPackage(
    id: number,
    updateAdditionalPackageDto: UpdateAdditionalPackageDto,
  ): Promise<ParkingDetails> {
    await this.findOne(id);

    const additionalFeePackageId =
      updateAdditionalPackageDto.additionalFeePackageId;

    if (additionalFeePackageId === null) {
      await this.parkingRepository.update(id, {
        additionalFeePackageId: null,
      });

      const parking = await this.parkingRepository.findOne({
        relations: { feePackage: true },
        where: { id, end: false },
      });

      if (parking) {
        await this.parkingRepository.update(id, {
          expectedEndTime: this.calculateExpectedEndTime(
            parking.parkedTime,
            parking.feePackage,
            undefined,
          ),
        });
      }

      return this.findOne(id);
    }

    const additionalFeePackage = await this.aditionalparkingRepository.findOneBy({
      id: additionalFeePackageId,
    });

    if (!additionalFeePackage) {
      throw new NotFoundException(`Package ${additionalFeePackageId} not found`);
    }

    await this.parkingRepository.update(id, {
      additionalFeePackageId: additionalFeePackage.id,
    });

    const parking = await this.parkingRepository.findOne({
      relations: { feePackage: true },
      where: { id, end: false },
    });

    if (parking) {
      await this.parkingRepository.update(id, {
        expectedEndTime: this.calculateExpectedEndTime(
          parking.parkedTime,
          parking.feePackage,
          additionalFeePackage,
        ),
      });
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<{ deleted: true }> {
    await this.findOne(id);
    await this.parkingRepository.delete(id);

    return { deleted: true };
  }

  async findEnded(): Promise<{ total: number; data: EndParking[] }> {
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
      where: { parkingId, end: true },
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
    // Fetch active parking record
    const parking = await this.parkingRepository.findOne({
      relations: { feePackage: true, parkingSlot: true },
      where: { id, end: false },
    });

    if (!parking) {
      throw new NotFoundException(`Active parking ${id} not found`);
    }

    // Validate and fetch additional fee package if provided
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

    // Calculate fees: base fees + additional fees (if provided)
    const parkEndTime = new Date();
    const baseFees = this.calculatePackageFees(parking.feePackage);
    const additionalFees = additionalFeePackage
      ? this.calculateAditionalparkingFees(additionalFeePackage)
      : 0;
    const fullFees = Number((baseFees + additionalFees).toFixed(2));

    // Use transaction to ensure atomicity:
    // 1. Log ended parking data to endparking table
    // 2. Mark the parking record as ended in parking table (keep history)
    return this.dataSource.transaction<EndParking>(async (manager) => {
      // Build the ended parking data, only including optional fields when they exist
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

      // Only add additional fee package if it exists
      if (additionalFeePackage) {
        endedParkingData.additionalFeePackage = additionalFeePackage;
        endedParkingData.additionalFeePackageId = additionalFeePackage.id;
      }

      // Create and log ended parking record
      const endedParking = manager
        .getRepository(EndParking)
        .create(endedParkingData);
      const savedEndedParking = await manager
        .getRepository(EndParking)
        .save(endedParking);

      // Keep the original parking row, but mark it as ended
      await manager.getRepository(Parking).update(id, {
        end: true,
        parkEndTime,
      });

      return savedEndedParking;
    });
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

  private calculateExpectedEndTime(
    parkedTime: Date,
    feePackage: Package,
    additional?: Aditionalparking,
  ): Date | null {
    const baseHours = this.parsePackageHours(feePackage.timeDuration);

    if (baseHours === null) {
      return null;
    }

    const additionalHours = additional?.hours ?? 0;
    const totalHours = baseHours + additionalHours;

    return new Date(parkedTime.getTime() + totalHours * 60 * 60 * 1000);
  }

  private parsePackageHours(timeDuration: string): number | null {
    // Supports strings like: "2 hours", "1.5 hour", "3h"
    const match = timeDuration.match(/(\d+(?:\.\d+)?)/);

    if (!match) {
      return null;
    }

    const value = Number(match[1]);

    return Number.isFinite(value) && value > 0 ? value : null;
  }
}
