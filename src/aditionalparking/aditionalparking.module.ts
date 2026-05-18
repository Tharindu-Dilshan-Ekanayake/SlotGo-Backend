import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AditionalparkingService } from './aditionalparking.service';
import { AditionalparkingController } from './aditionalparking.controller';
import { Aditionalparking } from './entities/aditionalparking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Aditionalparking])],
  controllers: [AditionalparkingController],
  providers: [AditionalparkingService],
})
export class AditionalparkingModule {}
