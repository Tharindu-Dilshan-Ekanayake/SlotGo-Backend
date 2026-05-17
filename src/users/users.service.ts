import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRoleType } from './entities/user-role-type.enum';
import { User } from './entities/user.entity';

export type PublicUser = Omit<User, 'password'>;

type UniqueViolationError = {
  code?: string;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<PublicUser> {
    const user = this.usersRepository.create({
      ...createUserDto,
      email: createUserDto.email.toLowerCase(),
      password: await hash(createUserDto.password, 10),
      role: createUserDto.role ?? UserRoleType.COUNTER,
    });

    try {
      return this.toPublicUser(await this.usersRepository.save(user));
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Email already exists');
      }

      throw error;
    }
  }

  async findAll(): Promise<PublicUser[]> {
    const users = await this.usersRepository.find({
      order: { id: 'ASC' },
    });

    return users.map((user) => this.toPublicUser(user));
  }

  async findOne(id: number): Promise<PublicUser> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return this.toPublicUser(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<PublicUser> {
    await this.findOne(id);

    const updateData: Partial<User> = {};

    if (updateUserDto.name !== undefined) {
      updateData.name = updateUserDto.name;
    }

    if (updateUserDto.email !== undefined) {
      updateData.email = updateUserDto.email.toLowerCase();
    }

    if (updateUserDto.password !== undefined) {
      updateData.password = await hash(updateUserDto.password, 10);
    }

    if (updateUserDto.role !== undefined) {
      updateData.role = updateUserDto.role;
    }

    try {
      await this.usersRepository.update(id, updateData);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Email already exists');
      }

      throw error;
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<{ deleted: true }> {
    await this.findOne(id);
    await this.usersRepository.delete(id);

    return { deleted: true };
  }

  count(): Promise<number> {
    return this.usersRepository.count();
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      select: [
        'id',
        'name',
        'email',
        'password',
        'role',
        'createdAt',
        'updatedAt',
      ],
      where: { email: email.toLowerCase() },
    });
  }

  toPublicUser(user: User): PublicUser {
    const publicUser = { ...user };
    delete (publicUser as Partial<User>).password;

    return publicUser;
  }

  private isUniqueViolation(error: unknown): error is UniqueViolationError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as UniqueViolationError).code === '23505'
    );
  }
}
