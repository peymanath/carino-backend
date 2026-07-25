import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../modules/database/prisma.service';
import { StandardResponseDto } from '../../shared/dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { CreatePermissionCategoryDto } from './dto/create-permission-category.dto';
import { UpdatePermissionCategoryDto } from './dto/update-permission-category.dto';
import { CategoryPermissionsDto, PermissionDto } from './dto/permission.dto';
import { PermissionCategoryDto } from './dto/permission-category.dto';
import { MESSAGES } from '../../shared/errors';
import { AssignPermissionsDto } from './dto/assign-permission.dto';
import { PermissionGetForUserDto } from './dto/permission-get-for-user.dto';
import { DEFAULT_PERMISSION_KEYS } from '../../shared/permissions/default-permissions';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  // #region ensurePermissionExists
  private async ensurePermissionExists(id: number): Promise<PermissionDto> {
    const permission = await this.prisma.permission.findUnique({ where: { id } });
    if (!permission) throw new NotFoundException({ detail: MESSAGES.fmtNamed('PERMISSION_NOT_FOUND', { id }) });
    return permission;
  }
  // #endregion

  // #region ensureCategoryExists
  private async ensureCategoryExists(id: number) {
    const c = await this.prisma.permissionCategory.findUnique({ where: { id } });
    if (!c) throw new NotFoundException({ detail: MESSAGES.fmt('PERMISSION_CATEGORY_NOT_FOUND', id) });
    return c;
  }
  // #endregion

  // #region validateCategory
  private async validateCategory(categoryId?: number) {
    if (!categoryId) return;

    const category = await this.prisma.permissionCategory.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException({
        detail: MESSAGES.fmt('PERMISSION_CATEGORY_ID_NOT_FOUND', categoryId),
      });
    }
  }
  // #endregion

  // #region createCategory
  async createCategory(createDto: CreatePermissionCategoryDto): Promise<StandardResponseDto<PermissionCategoryDto>> {
    const duplicate = await this.prisma.permissionCategory.findFirst({
      where: { name: createDto.name },
      select: { id: true },
    });

    if (duplicate) throw new BadRequestException({ detail: MESSAGES.fmt('PERMISSION_CATEGORY_NAME_EXISTS', createDto.name) });

    const createdPermissionCategory = await this.prisma.permissionCategory.create({
      data: { name: createDto.name },
    });

    return new StandardResponseDto({
      message: MESSAGES.PERMISSION_CATEGORY_NAME_CREATED,
      data: createdPermissionCategory,
    });
  }
  // #endregion

  // #region findAllCategories
  async findAllCategories(): Promise<StandardResponseDto<PermissionCategoryDto[]>> {
    const permissionCategories = await this.prisma.permissionCategory.findMany({
      orderBy: { id: 'asc' },
    });

    return new StandardResponseDto({
      message: MESSAGES.RECEIVED_DATA,
      data: permissionCategories,
    });
  }
  // #endregion

  // #region findCategoryById
  async findCategoryById(id: number): Promise<StandardResponseDto<PermissionCategoryDto>> {
    const permissionCategory = await this.ensureCategoryExists(id);

    if (!permissionCategory) throw new NotFoundException({ detail: MESSAGES.fmt('PERMISSION_CATEGORY_NOT_FOUND', id) });

    return new StandardResponseDto({
      message: MESSAGES.RECEIVED_DATA,
      data: permissionCategory,
    });
  }
  // #endregion

  // #region updateCategory
  async updateCategory(updateDto: UpdatePermissionCategoryDto): Promise<StandardResponseDto<PermissionCategoryDto>> {
    await this.ensureCategoryExists(updateDto.id);

    if (updateDto.name) {
      const conflict = await this.prisma.permissionCategory.findFirst({
        where: { name: updateDto.name, id: { not: updateDto.id } },
        select: { id: true },
      });
      if (conflict) throw new BadRequestException({ detail: MESSAGES.fmt('PERMISSION_CATEGORY_NAME_EXISTS', updateDto.id) });
    }

    const updatedCategoryPermistion = await this.prisma.permissionCategory.update({
      where: { id: updateDto.id },
      data: { name: updateDto.name },
    });

    return new StandardResponseDto({
      message: MESSAGES.UPDATED_DATA,
      data: updatedCategoryPermistion,
    });
  }
  // #endregion

  // #region removeCategory
  async removeCategory(id: number): Promise<void> {
    const category = await this.ensureCategoryExists(id);

    const count = await this.prisma.permission.count({ where: { categoryId: id } });
    if (count > 0) {
      throw new ConflictException({ detail: MESSAGES.fmtNamed('PERMISSION_CATEGORY_HAS_PERMISSIONS', { name: category.name, count }) });
    }

    await this.prisma.permissionCategory.delete({ where: { id } });
  }
  // #endregion

  // #region createPermission
  async createPermission(createDto: CreatePermissionDto): Promise<StandardResponseDto<PermissionDto>> {
    await this.validateCategory(createDto.categoryId);

    const duplicatePermission = await this.prisma.permission.findUnique({
      where: { key: createDto.key },
      select: { id: true },
    });

    if (duplicatePermission) throw new BadRequestException({ detail: MESSAGES.fmt('PERMISSION_KEY_EXISTS', createDto.key) });

    const created = await this.prisma.permission.create({
      data: {
        key: createDto.key,
        name: createDto.name,
        categoryId: createDto.categoryId,
      },
    });

    return new StandardResponseDto({
      message: MESSAGES.fmtNamed('PERMISSION_CREATED_BY_NAME', { name: created.name }),
      data: created,
    });
  }
  // #endregion

  // #region findAllPermissions
  async findAllPermissions(): Promise<StandardResponseDto<CategoryPermissionsDto[]>> {
    const rows = await this.prisma.permissionCategory.findMany({
      orderBy: { id: 'asc' },
      where: {
        permissions: {
          some: {},
        },
      },
      select: {
        id: true,
        name: true,
        permissions: {
          orderBy: { id: 'asc' },
          select: { id: true, key: true, name: true },
        },
      },
    });

    const data: CategoryPermissionsDto[] = rows.map(
      (c): CategoryPermissionsDto => ({
        categoryId: c.id,
        categoryName: c.name,
        permissions: c.permissions,
      })
    );

    return new StandardResponseDto({
      message: MESSAGES.RECEIVED_DATA,
      data: data,
    });
  }
  // #endregion

  // #region findPermissionById
  async findPermissionById(id: number): Promise<StandardResponseDto<PermissionDto>> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });
    if (!permission) throw new NotFoundException({ detail: MESSAGES.fmtNamed('PERMISSION_NOT_FOUND', { id }) });

    return new StandardResponseDto({
      message: MESSAGES.RECEIVED_DATA,
      data: permission,
    });
  }
  // #endregion

  // #region updatePermission
  async updatePermission(updateDto: UpdatePermissionDto): Promise<StandardResponseDto<PermissionDto>> {
    await this.ensurePermissionExists(updateDto.id);

    if (updateDto.key) {
      const conflict = await this.prisma.permission.findFirst({
        where: { key: updateDto.key, id: { not: updateDto.id } },
        select: { id: true },
      });
      if (conflict) throw new BadRequestException({ detail: MESSAGES.fmt('PERMISSION_KEY_EXISTS', updateDto.id) });
    }

    await this.validateCategory(updateDto.categoryId);

    const updatedPermistion = await this.prisma.permission.update({
      where: { id: updateDto.id },
      data: {
        key: updateDto.key,
        name: updateDto.name,
      },
    });

    return new StandardResponseDto({
      message: MESSAGES.UPDATED_DATA,
      data: updatedPermistion,
    });
  }
  // #endregion

  // #region removePermission
  async removePermission(id: number): Promise<void> {
    await this.ensurePermissionExists(id);

    await this.prisma.permission.delete({ where: { id } });
  }
  // #endregion

  // #region assignPermissions
  async assignPermissions(dto: AssignPermissionsDto): Promise<void> {
    const { userId, permissionIds } = dto;

    // 1) Ensure user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException({ detail: MESSAGES.fmtNamed('USER_ID_NOT_FOUND', { userId }) });
    }

    const uniqueIds = Array.from(new Set(permissionIds));

    if (uniqueIds.length > 0) {
      const rows = await this.prisma.permission.findMany({
        where: { id: { in: uniqueIds } },
        select: { id: true },
      });
      const found = new Set(rows.map(r => r.id));
      const missing = uniqueIds.filter(id => !found.has(id));
      if (missing.length) {
        throw new BadRequestException({ detail: MESSAGES.fmtNamed('PERMISSION_IDS_NOT_FOUND', { ids: missing.join(', ') }) });
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        permissions: {
          set: uniqueIds.map(id => ({ id })),
        },
      },
      select: { id: true },
    });
  }
  // #endregion

  // #region assignDefaultPermissions
  async assignDefaultPermissions(userId: number): Promise<void> {
    const permissions = await this.prisma.permission.findMany({
      where: {
        key: {
          in: [...DEFAULT_PERMISSION_KEYS],
        },
      },
      select: {
        id: true,
      },
    });

    await this.assignPermissions({
      userId,
      permissionIds: permissions.map(permission => permission.id),
    });
  }
  // #endregion

  // #region getForPermissionWithUserId
  async getForPermissionWithUserId(userId: number): Promise<StandardResponseDto<PermissionGetForUserDto>> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const userData = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { permissions: true },
    });

    if (!userData) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return new StandardResponseDto({
      data: {
        permissions: userData.permissions?.map(({ key }) => key) ?? [],
      },
    });
  }
  // #endregion
}
