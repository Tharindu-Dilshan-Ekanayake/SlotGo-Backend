import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePackageDto {
  @ApiProperty({ example: '2 hours' })
  @IsString()
  @MinLength(1)
  timeDuration: string;

  @ApiProperty({ example: 500 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  packagePrice: number;

  @ApiProperty({ example: 10, minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  offer: number;

  @ApiProperty({ default: true, example: true })
  @IsBoolean()
  activeStatus: boolean;
}
