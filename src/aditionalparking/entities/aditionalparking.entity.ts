import { ApiProperty } from '@nestjs/swagger';
import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

const decimalTransformer = {
	to: (value: number) => value,
	from: (value: string | number) => Number(value),
};

@Entity('aditionalparking')
export class Aditionalparking {
	@ApiProperty({ example: 1 })
	@PrimaryGeneratedColumn()
	id: number;

	@ApiProperty({ example: 2, description: 'Time range in hours' })
	@Column({ type: 'int' })
	hours: number;

	@ApiProperty({ example: 200, description: 'Fee for the time range' })
	@Column({
		type: 'decimal',
		precision: 10,
		scale: 2,
		transformer: decimalTransformer,
	})
	fee: number;

	@ApiProperty({ example: 10, minimum: 0, maximum: 100 })
	@Column({
		type: 'decimal',
		precision: 5,
		scale: 2,
		transformer: decimalTransformer,
	})
	discount: number;

	@ApiProperty({ example: '2026-05-18T08:30:00.000Z' })
	@CreateDateColumn()
	createdAt: Date;

	@ApiProperty({ example: '2026-05-18T08:30:00.000Z' })
	@UpdateDateColumn()
	updatedAt: Date;
}
