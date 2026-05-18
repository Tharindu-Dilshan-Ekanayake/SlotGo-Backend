import { PartialType } from '@nestjs/swagger';
import { CreateAditionalparkingDto } from './create-aditionalparking.dto';

export class UpdateAditionalparkingDto extends PartialType(CreateAditionalparkingDto) {}
