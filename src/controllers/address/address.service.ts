import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../modules/database/prisma.service';
import { Prisma } from '@prisma/client';
import { AddressResultDto, CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { QueryAddressDto } from './dto/query-address.dto';
import { StandardPaginatedResponseDto, StandardResponseDto } from '../../shared/dto';
import { paginateSlice } from '../../shared/utils';
import { MESSAGES } from '../../shared/errors';

@Injectable()
export class AddressService {
  constructor(private readonly prisma: PrismaService) {}

  // #region findAll
  async findAll(query: QueryAddressDto): Promise<StandardPaginatedResponseDto<AddressResultDto>> {
    const where: Prisma.AddressWhereInput = {
      ...(query.cityId ? { cityId: query.cityId } : {}),
      ...(query.isDefault !== undefined ? { isDefault: query.isDefault } : {}),
    };

    const data = await paginateSlice<AddressResultDto>(
      {
        page: query.page,
        pageSize: query.pageSize,
      },

      ({ skip, take }) =>
        this.prisma.address.findMany({
          skip,
          take,

          where,

          include: {
            city: true,
          },

          orderBy: {
            createdAt: 'desc',
          },
        })
    );

    return new StandardPaginatedResponseDto(data);
  }
  // #endregion

  // #region findForUser
  async findAllForUser(userId: number): Promise<StandardResponseDto<AddressResultDto[]>> {
    const getUserId = await this.getUser(userId);

    const data = await this.prisma.address.findMany({
      where: {
        userId: getUserId,
      },

      include: {
        city: true,
      },

      orderBy: [
        {
          isDefault: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });

    return new StandardResponseDto({
      data,
    });
  }
  // #endregion

  // #region findOne
  async findOne(id: number): Promise<StandardResponseDto<AddressResultDto>> {
    const address = await this.prisma.address.findUnique({
      where: {
        id,
      },

      include: {
        city: true,
      },
    });

    if (!address) throw new NotFoundException('آدرسی با این شناسه یافت نشد.');

    return new StandardResponseDto({
      data: address,
    });
  }
  // #endregion

  // #region findOneForUser
  async findOneForUser(id: number, userId: number): Promise<StandardResponseDto<AddressResultDto>> {
    const getUserId = await this.getUser(userId);

    const address = await this.prisma.address.findUnique({
      where: {
        id,
        userId: getUserId,
      },

      include: {
        city: true,
      },
    });

    if (!address) throw new NotFoundException('آدرسی با این شناسه یافت نشد.');

    return new StandardResponseDto({
      data: address,
    });
  }
  // #endregion

  // #region create
  async create(dto: CreateAddressDto, userId: number): Promise<StandardResponseDto<AddressResultDto>> {
    const getUserId = await this.getUser(userId);

    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: {
          userId: getUserId,
        },

        data: {
          isDefault: false,
        },
      });
    }

    const address = await this.prisma.address.create({
      data: { ...dto, userId: getUserId },

      include: {
        city: true,
      },
    });

    return new StandardResponseDto({
      message: 'آدرس جدید اضافه شد.',

      data: address,
    });
  }
  // #endregion

  // #region update
  async update(dto: UpdateAddressDto): Promise<StandardResponseDto<AddressResultDto>> {
    const { id, ...data } = dto;

    try {
      if (data.isDefault) {
        await this.prisma.address.updateMany({
          data: {
            isDefault: false,
          },
        });
      }

      const address = await this.prisma.address.update({
        where: {
          id,
        },
        data,
        include: {
          city: true,
        },
      });

      return new StandardResponseDto({
        message: 'آدرس به روز شد.',
        data: address,
      });
    } catch (e: unknown) {
      if (e instanceof Error && 'code' in e && e.code === 'P2025') {
        throw new NotFoundException('آدرس یافت نشد');
      }

      throw e;
    }
  }
  // #endregion

  // #region updateForUser
  async updateForUser(dto: UpdateAddressDto, userId: number): Promise<StandardResponseDto<AddressResultDto>> {
    const { id, ...data } = dto;

    const getUserId = await this.getUser(userId);

    try {
      if (data.isDefault && getUserId) {
        await this.prisma.address.updateMany({
          where: {
            userId: getUserId,
          },
          data: {
            isDefault: false,
          },
        });
      }

      const address = await this.prisma.address.update({
        where: {
          id,
        },
        data,
        include: {
          city: true,
        },
      });

      return new StandardResponseDto({
        message: 'آدرس به روز شد.',
        data: address,
      });
    } catch (e: unknown) {
      if (e instanceof Error && 'code' in e && e.code === 'P2025') {
        throw new NotFoundException('آدرس یافت نشد');
      }

      throw e;
    }
  }
  // #endregion

  // #region remove
  async remove(id: number): Promise<void> {
    try {
      await this.prisma.address.delete({
        where: {
          id,
        },
      });
    } catch (e: unknown) {
      if (e instanceof Error && 'code' in e && e.code === 'P2025') {
        throw new NotFoundException('آدرس یافت نشد');
      }
      throw e;
    }
  }
  // #endregion

  // #region removeForUser
  async removeForUser(id: number, userId: number): Promise<void> {
    const getUserId = await this.getUser(userId);

    try {
      await this.prisma.address.delete({
        where: {
          id,
          userId: getUserId,
        },
      });
    } catch (e: unknown) {
      if (e instanceof Error && 'code' in e && e.code === 'P2025') {
        throw new NotFoundException('آدرس یافت نشد');
      }
      throw e;
    }
  }
  // #endregion

  // #region getUser
  private async getUser(userId: number): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isDeleted: false },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException({ detail: MESSAGES.fmtNamed('USER_ID_NOT_FOUND', { userId }) });
    }
    return user.id;
  }
  // #endregion
}
