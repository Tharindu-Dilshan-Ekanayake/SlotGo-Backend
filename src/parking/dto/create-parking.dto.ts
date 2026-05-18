import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateParkingDto {
  @ApiProperty({ example: 'CAB-1234' })
  @IsString()
  @MinLength(1)
  vehicleNumber: string;

  @ApiPropertyOptional({ example: 'Nimal Perera' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  vehicleOwnerName?: string;

  @ApiProperty({ example: '0771234567' })
  @IsString()
  @MinLength(1)
  vehicleOwnerTelephone: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  slotId: number;

  @ApiProperty({ example: '2026-05-18T08:30:00.000Z' })
  @Type(() => Date)
  @IsDate()
  parkedTime: Date;

  @ApiPropertyOptional({ example: '2026-05-18T10:30:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  parkEndTime?: Date;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  feePackageId: number;
}
