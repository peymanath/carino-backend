import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ProblemDetailsDto, StandardResponseDto } from '../../shared/dto';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { CreatePermissionCategoryDto } from './dto/create-permission-category.dto';
import { UpdatePermissionCategoryDto } from './dto/update-permission-category.dto';
import { CategoryPermissionsDto, PermissionDto } from './dto/permission.dto';
import { PermissionCategoryDto } from './dto/permission-category.dto';
import { AssignPermissionsDto } from './dto/assign-permission.dto';
import { PermissionGetForUserDto } from './dto/permission-get-for-user.dto';
import { HasAuthentication } from '../../shared/decorators/auth-swagger.decorator';

@HasAuthentication()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
@ApiBadRequestResponse({ description: 'Bad Request', type: ProblemDetailsDto })
@ApiTags("Panel Permissions")
@Controller('panel/permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Category created', type: PermissionCategoryDto })
  async createCategory(@Body() dto: CreatePermissionCategoryDto): Promise<StandardResponseDto<PermissionCategoryDto>> {
    return this.permissionsService.createCategory(dto);
  }

  @Get('categories')
  @HttpCode(HttpStatus.OK)
  async findAllCategories(): Promise<StandardResponseDto<PermissionCategoryDto[]>> {
    return this.permissionsService.findAllCategories();
  }

  @Get('categories/:id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'Category id', type: Number })
  async findCategoryById(@Param('id') id: number): Promise<StandardResponseDto<PermissionCategoryDto>> {
    return this.permissionsService.findCategoryById(id);
  }

  @Patch('categories')
  @HttpCode(HttpStatus.OK)
  async updateCategory(@Body() dto: UpdatePermissionCategoryDto): Promise<StandardResponseDto<PermissionCategoryDto>> {
    return this.permissionsService.updateCategory(dto);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', description: 'Category id', type: Number })
  async removeCategory(@Param('id') id: number): Promise<void> {
    return this.permissionsService.removeCategory(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPermission(@Body() dto: CreatePermissionDto): Promise<StandardResponseDto<PermissionDto>> {
    return this.permissionsService.createPermission(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAllPermissions(): Promise<StandardResponseDto<CategoryPermissionsDto[]>> {
    return this.permissionsService.findAllPermissions();
  }

  @Get('get-for-user')
  @HttpCode(HttpStatus.OK)
  async getForUser(@Req() req: Request): Promise<StandardResponseDto<PermissionGetForUserDto>> {
    return this.permissionsService.getForPermissionWithUserId(req.user.id);
  }

  @Post('assign-to-user')
  @HttpCode(HttpStatus.NO_CONTENT)
  async assignToUser(@Body() dto: AssignPermissionsDto): Promise<void> {
    return this.permissionsService.assignPermissions(dto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'Permission id', type: Number })
  async findPermissionById(@Param('id') id: number): Promise<StandardResponseDto<PermissionDto>> {
    return this.permissionsService.findPermissionById(id);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  async updatePermission(@Body() dto: UpdatePermissionDto): Promise<StandardResponseDto<PermissionDto>> {
    return this.permissionsService.updatePermission(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', description: 'Permission id', type: Number })
  @ApiNoContentResponse({ description: 'Permission deleted' })
  async removePermission(@Param('id') id: number): Promise<void> {
    return this.permissionsService.removePermission(id);
  }
}
