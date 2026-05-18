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
import { EndParkingDto } from './dto/end-parking.dto';
import { UpdateParkingDto } from './dto/update-parking.dto';
import { EndParking } from './entities/end-parking.entity';
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
            token: 'PRK-CAB1234-ME7B9N2K-A1B2C3',
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

  @Get('ended')
  @ApiOperation({ summary: 'Get ended parking log records' })
  @ApiOkResponse({
    schema: {
      example: {
        total: 1,
        data: [
          {
            id: 1,
            parkingId: 12,
            vehicleNumber: 'CAB-1234',
            vehicleOwnerName: 'Nimal Perera',
            vehicleOwnerTelephone: '0771234567',
            token: 'PRK-CAB1234-ME7B9N2K-A1B2C3',
            slotId: 1,
            parkedTime: '2026-05-18T08:30:00.000Z',
            parkEndTime: '2026-05-18T10:30:00.000Z',
            end: true,
            feePackageId: 1,
            additionalFeePackageId: 2,
            fullFees: 900,
          },
        ],
      },
    },
  })
  findEnded() {
    return this.parkingService.findEnded();
  }

  @Get('ended/:parkingId')
  @ApiOperation({ summary: 'Get ended parking record and end status by parking ID' })
  @ApiParam({ name: 'parkingId', type: Number })
  @ApiOkResponse({ type: EndParking })
  findEndedByParkingId(@Param('parkingId', ParseIntPipe) parkingId: number) {
    return this.parkingService.findEndedByParkingId(parkingId);
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
        token: 'PRK-CAB1234-ME7B9N2K-A1B2C3',
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

  @Patch(':id/end')
  @ApiOperation({
    summary:
      'End an active parking record, log it to endparking, and delete it from parking',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: EndParking })
  endParking(
    @Param('id', ParseIntPipe) id: number,
    @Body() endParkingDto: EndParkingDto,
  ) {
    return this.parkingService.endParking(id, endParkingDto);
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
