import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Slot } from './entities/slot.entity';
import { SlotsService } from './slots.service';

describe('SlotsService', () => {
  let service: SlotsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlotsService,
        {
          provide: getRepositoryToken(Slot),
          useValue: {
            create: jest.fn(),
            delete: jest.fn(),
            findAndCount: jest.fn(),
            findOneBy: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SlotsService>(SlotsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
