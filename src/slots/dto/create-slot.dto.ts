import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateSlotDto {
	@ApiProperty({ example: 'Main Hall Slot A' })
	@IsString()
	@MinLength(1)
	name: string;
}
