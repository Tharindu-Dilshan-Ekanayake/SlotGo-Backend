import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRoleType } from './user-role-type.enum';

@Entity()
export class User {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Admin User' })
  @Column()
  name: string;

  @ApiProperty({ example: 'admin@example.com' })
  @Column({ nullable: true, unique: true })
  email: string;

  @ApiHideProperty()
  @Column({ select: false })
  password: string;

  @ApiProperty({ enum: UserRoleType, example: UserRoleType.ADMIN })
  @Column({
    type: 'enum',
    enum: UserRoleType,
    default: UserRoleType.COUNTER,
  })
  role: UserRoleType;

  @ApiProperty({ example: '2026-05-17T00:00:00.000Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2026-05-17T00:00:00.000Z' })
  @UpdateDateColumn()
  updatedAt: Date;
}
