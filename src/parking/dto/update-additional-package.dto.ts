import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, ValidateIf } from 'class-validator';

export class UpdateAdditionalPackageDto {
  @ApiProperty({
    example: 2,
    nullable: true,
    description:
      'Additional package id for this parking. Send null to clear the additional package.',
  })
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(1)
  additionalFeePackageId: number | null;
}
