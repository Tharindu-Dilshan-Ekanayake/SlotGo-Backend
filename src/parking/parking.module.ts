import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Package } from '../packages/entities/package.entity';
import { Slot } from '../slots/entities/slot.entity';
import { Parking } from './entities/parking.entity';
import { ParkingService } from './parking.service';
import { ParkingController } from './parking.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Parking, Slot, Package])],
  controllers: [ParkingController],
  providers: [ParkingService],
})
export class ParkingModule {}
