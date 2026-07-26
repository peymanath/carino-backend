import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressResultDto, CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { QueryAddressDto } from './dto/query-address.dto';
import { StandardPaginatedResponseDto, StandardResponseDto } from '../../shared/dto';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { HasAuthentication } from '../../shared/decorators/auth-swagger.decorator';
import { PERMISSIONS } from 'src/shared/permissions/permissions';

@HasAuthentication()
@Controller('panel/addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: Request, @Body() dto: CreateAddressDto) {
    return this.addressService.create(dto, req.user.id);
  }

  @Get()
  @Permissions(PERMISSIONS.ADDRESSES_READ)
  async findAll(@Query() query: QueryAddressDto): Promise<StandardPaginatedResponseDto<AddressResultDto>> {
    return this.addressService.findAll(query);
  }

  @Get('findAllForUser')
  async findAllForUser(@Req() req: Request): Promise<StandardResponseDto<AddressResultDto[]>> {
    return this.addressService.findAllForUser(req.user.id);
  }

  @Get('findOneForUser/:id')
  async findOneForUser(@Req() req: Request, @Param('id', ParseIntPipe) id: number): Promise<StandardResponseDto<AddressResultDto>> {
    return this.addressService.findOneForUser(id, req.user.id);
  }

  @Patch('updateForUser')
  async updateForUser(@Req() req: Request, @Body() dto: UpdateAddressDto) {
    return this.addressService.updateForUser(dto, req.user.id);
  }

  @Delete('removeForUser/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeForUser(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.addressService.removeForUser(id, req.user.id);
  }

  @Get(':id')
  @Permissions(PERMISSIONS.ADDRESSES_READ)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<StandardResponseDto<AddressResultDto>> {
    return this.addressService.findOne(id);
  }

  @Patch()
  @Permissions(PERMISSIONS.ADDRESSES_UPDATE)
  async update(@Body() dto: UpdateAddressDto) {
    return this.addressService.update(dto);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.ADDRESSES_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.addressService.remove(id);
  }
}
