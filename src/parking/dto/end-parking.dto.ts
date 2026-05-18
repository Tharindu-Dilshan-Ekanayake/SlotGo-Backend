import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class EndParkingDto {
  @ApiPropertyOptional({
    example: 2,
    description:
      'Optional package id for additional parking time. This will add extra time and fees on top of the base parking package. The additional fees will be calculated and included in the total fullFees.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  additionalFeePackageId?: number;
}
