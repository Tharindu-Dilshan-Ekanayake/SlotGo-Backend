import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlotsService } from './slots.service';
import { SlotsController } from './slots.controller';
import { Slot } from './entities/slot.entity';
import { Parking } from '../parking/entities/parking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Slot, Parking])],
  controllers: [SlotsController],
  providers: [SlotsService],
})
export class SlotsModule {}
