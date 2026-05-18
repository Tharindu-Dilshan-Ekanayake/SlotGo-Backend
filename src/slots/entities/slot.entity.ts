import { ApiProperty } from '@nestjs/swagger';
import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Slot {
	@ApiProperty({ example: 1 })
	@PrimaryGeneratedColumn()
	id: number;

	@ApiProperty({ example: 'Main Hall Slot A' })
	@Column()
	name: string;

	@ApiProperty({ example: '2026-05-17T00:00:00.000Z' })
	@CreateDateColumn()
	createdAt: Date;

	@ApiProperty({ example: '2026-05-17T00:00:00.000Z' })
	@UpdateDateColumn()
	updatedAt: Date;
}
