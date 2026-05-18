import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ParkingTokenDto {
  @ApiProperty({ example: 'PRK-CAB1234-ME7B9N2K-A1B2C3' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
