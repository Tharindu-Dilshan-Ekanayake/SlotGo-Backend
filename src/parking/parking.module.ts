import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aditionalparking } from '../aditionalparking/entities/aditionalparking.entity';
import { Package } from '../packages/entities/package.entity';
import { Slot } from '../slots/entities/slot.entity';
import { EndParking } from './entities/end-parking.entity';
import { Parking } from './entities/parking.entity';
import { ParkingService } from './parking.service';
import { ParkingController } from './parking.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Parking, EndParking, Slot, Package, Aditionalparking]),
  ],
  controllers: [ParkingController],
  providers: [ParkingService],
})
export class ParkingModule {}
