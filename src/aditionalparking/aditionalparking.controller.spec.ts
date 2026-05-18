import { Test, TestingModule } from '@nestjs/testing';
import { AditionalparkingController } from './aditionalparking.controller';
import { AditionalparkingService } from './aditionalparking.service';

describe('AditionalparkingController', () => {
  let controller: AditionalparkingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AditionalparkingController],
      providers: [
        {
          provide: AditionalparkingService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AditionalparkingController>(AditionalparkingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
