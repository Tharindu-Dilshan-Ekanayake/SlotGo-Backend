import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Package } from '../../packages/entities/package.entity';
import { Aditionalparking } from '../../aditionalparking/entities/aditionalparking.entity';
import { Slot } from '../../slots/entities/slot.entity';

const decimalTransformer = {
  to: (value: number) => value,
  from: (value: string | number) => Number(value),
};

@Entity('endparking')
export class EndParking {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 12 })
  @Column()
  parkingId: number;

  @ApiProperty({ example: 'CAB-1234' })
  @Column()
  vehicleNumber: string;

  @ApiPropertyOptional({ example: 'Nimal Perera' })
  @Column({ nullable: true })
  vehicleOwnerName?: string;

  @ApiProperty({ example: '0771234567' })
  @Column()
  vehicleOwnerTelephone: string;

  @ApiPropertyOptional({ example: 'PRK-CAB1234-ME7B9N2K-A1B2C3' })
  @Column({ nullable: true })
  token?: string;

  @ApiProperty({ example: 1 })
  @Column()
  slotId: number;

  @ApiProperty({ type: () => Slot })
  @ManyToOne(() => Slot, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'slotId' })
  parkingSlot: Slot;

  @ApiProperty({ example: '2026-05-18T08:30:00.000Z' })
  @Column({ type: 'timestamp' })
  parkedTime: Date;

  @ApiProperty({ example: '2026-05-18T10:30:00.000Z' })
  @Column({ type: 'timestamp' })
  parkEndTime: Date;

  @ApiProperty({ default: true, example: true })
  @Column({ default: true })
  end: boolean;

  @ApiProperty({ example: 1 })
  @Column()
  feePackageId: number;

  @ApiProperty({ type: () => Package })
  @ManyToOne(() => Package, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'feePackageId' })
  feePackage: Package;

  @ApiPropertyOptional({ example: 2 })
  @Column({ nullable: true })
  additionalFeePackageId?: number;

  @ApiPropertyOptional({ type: () => Aditionalparking })
  @ManyToOne(() => Aditionalparking, {
    nullable: true,
    onDelete: 'RESTRICT',
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'additionalFeePackageId' })
  additionalFeePackage?: Aditionalparking;

  @ApiProperty({ example: 900 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  fullFees: number;

  @ApiProperty({ example: '2026-05-18T08:30:00.000Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2026-05-18T08:30:00.000Z' })
  @UpdateDateColumn()
  updatedAt: Date;
}
