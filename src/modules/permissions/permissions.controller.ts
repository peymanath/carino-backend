import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ProblemDetailsDto, StandardResponseDto } from '@/shared/dto';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { CreatePermissionCategoryDto } from './dto/create-permission-category.dto';
import { UpdatePermissionCategoryDto } from './dto/update-permission-category.dto';
import { CategoryPermissionsDto, PermissionDto } from './dto/permission.dto';
import { PermissionCategoryDto } from './dto/permission-category.dto';
import { AssignPermissionsDto } from './dto/assign-permission.dto';
import { PermissionGetForUserDto } from './dto/permission-get-for-user.dto';
import { HasAuthentication } from '@/shared/decorators/auth-swagger.decorator';

@HasAuthentication()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
@ApiBadRequestResponse({ description: 'Bad Request', type: ProblemDetailsDto })
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create permission category' })
  @ApiCreatedResponse({ description: 'Category created', type: PermissionCategoryDto })
  async createCategory(@Body() dto: CreatePermissionCategoryDto): Promise<StandardResponseDto<PermissionCategoryDto>> {
    return this.permissionsService.createCategory(dto);
  }

  @Get('categories')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List permission categories' })
  @ApiOkResponse({ description: 'List of categories', type: [PermissionCategoryDto] })
  async findAllCategories(): Promise<StandardResponseDto<PermissionCategoryDto[]>> {
    return this.permissionsService.findAllCategories();
  }

  @Get('categories/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get category by id' })
  @ApiParam({ name: 'id', description: 'Category id', type: Number })
  @ApiOkResponse({ description: 'Category', type: PermissionCategoryDto })
  async findCategoryById(@Param('id') id: number): Promise<StandardResponseDto<PermissionCategoryDto>> {
    return this.permissionsService.findCategoryById(id);
  }

  @Patch('categories')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update category' })
  @ApiOkResponse({ description: 'Category updated', type: PermissionCategoryDto })
  async updateCategory(@Body() dto: UpdatePermissionCategoryDto): Promise<StandardResponseDto<PermissionCategoryDto>> {
    return this.permissionsService.updateCategory(dto);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete category' })
  @ApiParam({ name: 'id', description: 'Category id', type: Number })
  @ApiNoContentResponse({ description: 'Category deleted' })
  async removeCategory(@Param('id') id: number): Promise<void> {
    return this.permissionsService.removeCategory(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create permission' })
  @ApiCreatedResponse({ description: 'Permission created', type: PermissionDto })
  async createPermission(@Body() dto: CreatePermissionDto): Promise<StandardResponseDto<PermissionDto>> {
    return this.permissionsService.createPermission(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List permissions' })
  async findAllPermissions(): Promise<StandardResponseDto<CategoryPermissionsDto[]>> {
    return this.permissionsService.findAllPermissions();
  }

  @Get('get-for-user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user permission list' })
  @ApiNoContentResponse({ description: 'Permission List' })
  async getForUser(@Req() req: Request): Promise<StandardResponseDto<PermissionGetForUserDto>> {
    return this.permissionsService.getForPermissionWithUserId(req.user.id);
  }

  @Post('assign-to-user')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Replace user's permissions with the provided list" })
  @ApiNoContentResponse({ description: 'Permission added' })
  async assignToUser(@Body() dto: AssignPermissionsDto): Promise<void> {
    return this.permissionsService.assignPermissions(dto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get permission by id' })
  @ApiParam({ name: 'id', description: 'Permission id', type: Number })
  @ApiOkResponse({ description: 'Permission', type: PermissionDto })
  async findPermissionById(@Param('id') id: number): Promise<StandardResponseDto<PermissionDto>> {
    return this.permissionsService.findPermissionById(id);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update permission' })
  @ApiOkResponse({ description: 'Permission updated', type: PermissionDto })
  async updatePermission(@Body() dto: UpdatePermissionDto): Promise<StandardResponseDto<PermissionDto>> {
    return this.permissionsService.updatePermission(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete permission' })
  @ApiParam({ name: 'id', description: 'Permission id', type: Number })
  @ApiNoContentResponse({ description: 'Permission deleted' })
  async removePermission(@Param('id') id: number): Promise<void> {
    return this.permissionsService.removePermission(id);
  }
}
