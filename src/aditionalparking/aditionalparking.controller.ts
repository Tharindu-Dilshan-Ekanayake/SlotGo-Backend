import {
  Body,
  Controller,
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
import { AditionalparkingService } from './aditionalparking.service';
import { CreateAditionalparkingDto } from './dto/create-aditionalparking.dto';
import { UpdateAditionalparkingDto } from './dto/update-aditionalparking.dto';
import { Aditionalparking } from './entities/aditionalparking.entity';

@ApiTags('aditionalparking')
@Controller('aditionalparking')
export class AditionalparkingController {
  constructor(private readonly aditionalparkingService: AditionalparkingService) {}

  @Post()
  @ApiOperation({ summary: 'Create an additional parking package' })
  @ApiCreatedResponse({ type: Aditionalparking })
  create(@Body() createAditionalparkingDto: CreateAditionalparkingDto) {
    return this.aditionalparkingService.create(createAditionalparkingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all additional parking packages with total count' })
  @ApiOkResponse({
    schema: {
      example: {
        total: 2,
        data: [
          {
            id: 1,
            hours: 1,
            fee: 100,
            discount: 0,
            createdAt: '2026-05-18T08:30:00.000Z',
            updatedAt: '2026-05-18T08:30:00.000Z',
          },
        ],
      },
    },
  })
  findAll() {
    return this.aditionalparkingService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one additional parking package' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Aditionalparking })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.aditionalparkingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an additional parking package' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Aditionalparking })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAditionalparkingDto: UpdateAditionalparkingDto,
  ) {
    return this.aditionalparkingService.update(id, updateAditionalparkingDto);
  }
}
