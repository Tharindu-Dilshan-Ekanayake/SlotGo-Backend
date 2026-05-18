import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AditionalparkingService } from './aditionalparking.service';
import { Aditionalparking } from './entities/aditionalparking.entity';

describe('AditionalparkingService', () => {
  let service: AditionalparkingService;

  beforeEach(async () => {
    const repositoryMock = {
      create: jest.fn(),
      findAndCount: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AditionalparkingService,
        {
          provide: getRepositoryToken(Aditionalparking),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<AditionalparkingService>(AditionalparkingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
