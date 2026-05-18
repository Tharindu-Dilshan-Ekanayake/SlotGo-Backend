import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ParkingService } from './parking.service';
import { CreateParkingDto } from './dto/create-parking.dto';
import { UpdateParkingDto } from './dto/update-parking.dto';
import { Parking } from './entities/parking.entity';

@ApiTags('parking')
@Controller('parking')
export class ParkingController {
  constructor(private readonly parkingService: ParkingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a parking record' })
  @ApiCreatedResponse({ type: Parking })
  create(@Body() createParkingDto: CreateParkingDto) {
    return this.parkingService.create(createParkingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all parking records with total count' })
  @ApiOkResponse({
    schema: {
      example: {
        total: 2,
        data: [
          {
            id: 1,
            vehicleNumber: 'CAB-1234',
            vehicleOwnerName: 'Nimal Perera',
            vehicleOwnerTelephone: '0771234567',
            slotId: 1,
            parkingSlot: {
              id: 1,
              name: 'Main Hall Slot A',
              createdAt: '2026-05-18T08:00:00.000Z',
              updatedAt: '2026-05-18T08:00:00.000Z',
            },
            parkedTime: '2026-05-18T08:30:00.000Z',
            parkEndTime: null,
            feePackageId: 1,
            feePackage: {
              id: 1,
              timeDuration: '2 hours',
              packagePrice: 500,
              offer: 10,
              activeStatus: true,
              createdAt: '2026-05-18T08:00:00.000Z',
              updatedAt: '2026-05-18T08:00:00.000Z',
            },
            fullFees: 450,
            ongoing: true,
            createdAt: '2026-05-18T08:30:00.000Z',
            updatedAt: '2026-05-18T08:30:00.000Z',
          },
        ],
      },
    },
  })
  findAll() {
    return this.parkingService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one parking record' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({
    schema: {
      example: {
        id: 1,
        vehicleNumber: 'CAB-1234',
        vehicleOwnerName: 'Nimal Perera',
        vehicleOwnerTelephone: '0771234567',
        slotId: 1,
        parkingSlot: {
          id: 1,
          name: 'Main Hall Slot A',
          createdAt: '2026-05-18T08:00:00.000Z',
          updatedAt: '2026-05-18T08:00:00.000Z',
        },
        parkedTime: '2026-05-18T08:30:00.000Z',
        parkEndTime: null,
        feePackageId: 1,
        feePackage: {
          id: 1,
          timeDuration: '2 hours',
          packagePrice: 500,
          offer: 10,
          activeStatus: true,
          createdAt: '2026-05-18T08:00:00.000Z',
          updatedAt: '2026-05-18T08:00:00.000Z',
        },
        fullFees: 450,
        ongoing: true,
        createdAt: '2026-05-18T08:30:00.000Z',
        updatedAt: '2026-05-18T08:30:00.000Z',
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.parkingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a parking record' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Parking })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateParkingDto: UpdateParkingDto,
  ) {
    return this.parkingService.update(id, updateParkingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a parking record' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ schema: { example: { deleted: true } } })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.parkingService.remove(id);
  }
}
