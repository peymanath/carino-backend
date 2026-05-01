import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, QueryUserDto, UpdateUserDto } from './dto';
import { StandardPaginatedResponseDto, StandardResponseDto } from '@/shared/dto';
import { User } from '@prisma/client';
import { Permissions } from '@/shared/decorators/permissions.decorator';
import { HasAuthentication } from '@/shared/decorators/auth-swagger.decorator';

@HasAuthentication()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Permissions('users.create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @Permissions('users.read')
  async findAll(@Query() query: QueryUserDto): Promise<StandardPaginatedResponseDto<User>> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Permissions('users.read')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<StandardResponseDto<User>> {
    return this.usersService.findOne(id);
  }

  @Patch()
  @Permissions('users.update')
  async update(@Body() dto: UpdateUserDto): Promise<StandardResponseDto<User>> {
    return this.usersService.update(dto);
  }

  @Delete(':id')
  @Permissions('users.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.usersService.remove(id);
  }
}
