import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateParkingDto } from './create-parking.dto';

export class UpdateParkingDto extends PartialType(CreateParkingDto) {
  @ApiPropertyOptional({
    example: true,
    description:
      'Set to true for ongoing parking (clears parkEndTime), false to mark as ended (sets parkEndTime to now)',
  })
  @IsOptional()
  @IsBoolean()
  ongoing?: boolean;
}
