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

@Entity('packages')
export class Package {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '2 hours' })
  @Column()
  timeDuration: string;

  @ApiProperty({ example: 500 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  packagePrice: number;

  @ApiProperty({ example: 10, minimum: 0, maximum: 100 })
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    transformer: decimalTransformer,
  })
  offer: number;

  @ApiProperty({ default: true, example: true })
  @Column({ default: true })
  activeStatus: boolean;

  @ApiProperty({ example: '2026-05-17T00:00:00.000Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2026-05-17T00:00:00.000Z' })
  @UpdateDateColumn()
  updatedAt: Date;
}
