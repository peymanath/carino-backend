import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../modules/database/prisma.service';
import { Prisma, User } from '@prisma/client';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { StandardPaginatedResponseDto, StandardResponseDto } from '../../shared/dto';
import { paginateSlice } from '../../shared/utils';
import { PermissionsService } from '../permissions/permissions.service';
import { MESSAGES } from '../../shared/errors';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissionsService: PermissionsService
  ) {}

  // #region findAll
  async findAll(query: QueryUserDto): Promise<StandardPaginatedResponseDto<User>> {
    const where: Prisma.UserWhereInput = {
      ...(query.mobile ? { mobile: query.mobile } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.isMobileVerified !== undefined ? { isMobileVerified: query.isMobileVerified } : {}),
    };

    const data = await paginateSlice<User>({ page: query.page, pageSize: query.pageSize }, ({ skip, take }) =>
      this.prisma.user.findMany({
        skip,
        take,
        where,
        include: { profile: true },
        orderBy: { createdAt: 'desc' },
      })
    );

    return new StandardPaginatedResponseDto(data);
  }
  // #endregion

  // #region findOne
  async findOne(id: number): Promise<StandardResponseDto<User>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!user) throw new NotFoundException('کاربری با این شناسه یافت نشد.');

    return new StandardResponseDto({ data: user });
  }
  // #endregion

  // #region create
  async create(dto: CreateUserDto): Promise<StandardResponseDto<User>> {
    const { mobile, ...userData } = dto;

    const newUser = await this.prisma.user.create({
      data: {
        mobile,
        profile: userData
          ? {
              create: {
                ...userData,
              },
            }
          : undefined,
      },
      include: { profile: true },
    });

    // تخصیص پرمیشن های پیش فرض
    await this.permissionsService.assignDefaultPermissions(newUser.id);

    // گرفتن مجدد دیتای کاربر
    const user = await this.findOneWithUserId(newUser.id);

    return new StandardResponseDto({
      message: 'کاربر جدید اضافه شد.',
      data: user!,
    });
  }
  // #endregion

  // #region update
  async update(dto: UpdateUserDto): Promise<StandardResponseDto<User>> {
    const { mobile, id, ...userData } = dto;

    try {
      const updateUser = await this.prisma.user.update({
        where: { id },
        data: {
          mobile,
          profile: userData
            ? {
                upsert: {
                  create: { ...userData },
                  update: { ...userData },
                },
              }
            : undefined,
        },
        include: { profile: true },
      });

      return new StandardResponseDto({
        message: 'اطلاعات کاربر به روز شد.',
        data: updateUser,
      });
    } catch (e: unknown) {
      if (e instanceof Error && 'code' in e && e.code === 'P2025') {
        throw new NotFoundException('کاربر یافت نشد');
      }
      throw e;
    }
  }
  // #endregion

  // #region remove
  async remove(id: number): Promise<void> {
    // Fetch only what's needed
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        profile: { select: { avatarId: true } },
      },
    });

    if (!user) throw new NotFoundException(MESSAGES.USER_NOT_FOUND);

    await this.prisma.$transaction(async tx => {
      // 1) Soft delete user
      await tx.user.update({
        where: { id: user.id },
        data: { isDeleted: true },
      });

      // 2) Soft delete all related profiles
      await tx.userProfile.updateMany({
        where: { userId: user.id },
        data: { isDeleted: true },
      });
    });

    // 3) Soft delete avatar media (if exists)
    const avatarId = user.profile?.avatarId;
    if (avatarId) {
      await this.prisma.media.updateMany({
        where: {
          id: avatarId, // target media by its id
          userId: user.id, // guard: ensure it belongs to the same user
          isDeleted: false,
        },
        data: { isDeleted: true },
      });
    }
  }
  // #endregion

  // #region findOneWithMobile
  async findOneWithMobile(mobile: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { mobile } });
  }
  // #endregion

  // #region findOneWithUserId
  async findOneWithUserId(userId: number): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { id: userId } });
  }
  // #endregion
}
