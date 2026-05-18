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

@Entity('parking')
export class Parking {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'CAB-1234' })
  @Column()
  vehicleNumber: string;

  @ApiPropertyOptional({ example: 'Nimal Perera' })
  @Column({ nullable: true })
  vehicleOwnerName?: string;

  @ApiProperty({ example: '0771234567' })
  @Column()
  vehicleOwnerTelephone: string;

  @ApiProperty({ example: 'PRK-CAB1234-ME7B9N2K-A1B2C3' })
  @Column({ nullable: true, unique: true })
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

  @ApiPropertyOptional({
    example: '2026-05-18T10:30:00.000Z',
    description:
      'Auto-calculated expected end time (base package duration + additional package hours).',
  })
  @Column({ nullable: true, type: 'timestamp' })
  expectedEndTime?: Date | null;

  @ApiPropertyOptional({ example: '2026-05-18T10:30:00.000Z' })
  @Column({ nullable: true, type: 'timestamp' })
  parkEndTime?: Date;

  @ApiProperty({ default: false, example: false })
  @Column({ default: false })
  end: boolean;

  @ApiProperty({ example: 1 })
  @Column()
  feePackageId: number;

  @ApiProperty({ type: () => Package })
  @ManyToOne(() => Package, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'feePackageId' })
  feePackage: Package;

  @ApiPropertyOptional({ example: 2, nullable: true })
  @Column({ nullable: true })
  additionalFeePackageId?: number | null;

  @ApiPropertyOptional({ type: () => Aditionalparking })
  @ManyToOne(() => Aditionalparking, {
    nullable: true,
    onDelete: 'RESTRICT',
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'additionalFeePackageId' })
  additionalFeePackage?: Aditionalparking;

  @ApiProperty({ example: '2026-05-18T08:30:00.000Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2026-05-18T08:30:00.000Z' })
  @UpdateDateColumn()
  updatedAt: Date;
}
