import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class CreateAditionalparkingDto {
	@ApiProperty({ example: 2, description: 'Time range in hours' })
	@IsInt()
	@Min(1)
	hours: number;

	@ApiProperty({ example: 200, description: 'Fee for the time range' })
	@IsNumber()
	@Min(0)
	fee: number;

	@ApiProperty({ example: 10, minimum: 0, maximum: 100 })
	@IsNumber()
	@Min(0)
	@Max(100)
	discount: number;
}
