import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Aditionalparking } from '../aditionalparking/entities/aditionalparking.entity';
import { Package } from '../packages/entities/package.entity';
import { Slot } from '../slots/entities/slot.entity';
import { EndParking } from './entities/end-parking.entity';
import { Parking } from './entities/parking.entity';
import { ParkingService } from './parking.service';

describe('ParkingService', () => {
  let service: ParkingService;

  beforeEach(async () => {
    const repositoryMock = {
      create: jest.fn(),
      delete: jest.fn(),
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParkingService,
        {
          provide: getRepositoryToken(Parking),
          useValue: repositoryMock,
        },
        {
          provide: getRepositoryToken(EndParking),
          useValue: repositoryMock,
        },
        {
          provide: getRepositoryToken(Slot),
          useValue: repositoryMock,
        },
        {
          provide: getRepositoryToken(Package),
          useValue: repositoryMock,
        },
        {
          provide: getRepositoryToken(Aditionalparking),
          useValue: repositoryMock,
        },
        {
          provide: DataSource,
          useValue: { transaction: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ParkingService>(ParkingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
