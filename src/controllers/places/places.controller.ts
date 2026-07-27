import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { PlacesService } from './places.service';
import { CreatePlaceDto, QueryPlaceDto, UpdatePlaceDto } from './dto';
import { StandardPaginatedResponseDto, StandardResponseDto } from '../../shared/dto';
import { PlaceProfile } from '@prisma/client';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { HasAuthentication } from '../../shared/decorators/auth-swagger.decorator';
import { PERMISSIONS } from 'src/shared/permissions/permissions';

@HasAuthentication()
@Controller('panel/places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  @Permissions(PERMISSIONS.PLACES_CREATE)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePlaceDto) {
    return this.placesService.create(dto);
  }

  @Get()
  @Permissions(PERMISSIONS.PLACES_READ)
  async findAll(@Query() query: QueryPlaceDto): Promise<StandardPaginatedResponseDto<PlaceProfile>> {
    return this.placesService.findAll(query);
  }

  @Get(':id')
  @Permissions(PERMISSIONS.PLACES_READ)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<StandardResponseDto<PlaceProfile>> {
    return this.placesService.findOne(id);
  }

  @Patch()
  @Permissions(PERMISSIONS.PLACES_UPDATE)
  async update(@Body() dto: UpdatePlaceDto): Promise<StandardResponseDto<PlaceProfile>> {
    return this.placesService.update(dto);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.PLACES_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.placesService.remove(id);
  }
}
