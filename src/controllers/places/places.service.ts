import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../modules/database/prisma.service';
import { Prisma, PlaceProfile } from '@prisma/client';
import { CreatePlaceDto, UpdatePlaceDto } from './dto';
import { QueryPlaceDto } from './dto/query-place.dto';
import { StandardPaginatedResponseDto, StandardResponseDto } from '../../shared/dto';
import { paginateSlice } from '../../shared/utils';
import { GisService } from '../../modules/gis/gis.service';
import { ICoordinate } from '../../modules/gis/interfaces';
import { MESSAGES } from '../../shared/errors';

@Injectable()
export class PlacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gis: GisService
  ) {}

  // #region findAll
  async findAll(query: QueryPlaceDto): Promise<StandardPaginatedResponseDto<PlaceProfile>> {
    const where: Prisma.PlaceProfileWhereInput = {
      ...(query.cityId ? { cityId: query.cityId } : {}),
      ...(query.type !== undefined ? { type: query.type } : {}),
    };

    const data = await paginateSlice<PlaceProfile>({ page: query.page, pageSize: query.pageSize }, ({ skip, take }) =>
      this.prisma.placeProfile.findMany({
        skip,
        take,
        where,
        include: { locations: true, city: true },
        orderBy: { createdAt: 'desc' },
      })
    );

    return new StandardPaginatedResponseDto(data);
  }
  // #endregion

  // #region findOne
  async findOne(id: number): Promise<StandardResponseDto<PlaceProfile>> {
    const place = await this.prisma.placeProfile.findUnique({
      where: {
        id,
      },

      include: {
        locations: true,
        city: true,
      },
    });

    if (!place) {
      throw new NotFoundException(MESSAGES.fmtNamed('PLACE_ID_NOT_FOUND', { id }));
    }

    return new StandardResponseDto({
      data: place,
    });
  }
  // #endregion

  // #region create
  async create({ latitude, longitude, ...dto }: CreatePlaceDto): Promise<StandardResponseDto<PlaceProfile>> {
    // Normalize Gis
    const normalizedCoordinate = this.gis.validateCoordinate({ latitude, longitude });

    const place = await this.prisma.placeProfile.create({
      data: {
        ...dto,
        locations: {
          create: {
            latitude: normalizedCoordinate.latitude,
            longitude: normalizedCoordinate.longitude,
            type: dto.type,
          },
        },
      },
      include: {
        locations: true,
        city: true,
      },
    });

    return new StandardResponseDto({ data: place });
  }
  // #endregion

  // #region update
  async update(dto: UpdatePlaceDto): Promise<StandardResponseDto<PlaceProfile>> {
    const { id, latitude, longitude, ...placeData } = dto;

    // Normalize Gis
    let normalizedCoordinate: ICoordinate | undefined = undefined;
    if (!!latitude && !!longitude) {
      normalizedCoordinate = this.gis.validateCoordinate({ latitude, longitude });
    }

    try {
      const place = await this.prisma.placeProfile.update({
        where: {
          id,
        },
        data: {
          ...placeData,
          locations: {
            updateMany: {
              where: {},
              data: {
                ...(normalizedCoordinate?.latitude !== undefined ? { latitude: normalizedCoordinate.latitude } : {}),

                ...(normalizedCoordinate?.longitude !== undefined ? { longitude: normalizedCoordinate.longitude } : {}),

                ...(dto.type !== undefined ? { type: dto.type } : {}),
              },
            },
          },
        },
        include: {
          locations: true,
          city: true,
        },
      });

      return new StandardResponseDto({ data: place });
    } catch (e: unknown) {
      if (e instanceof Error && 'code' in e && e.code === 'P2025') {
        throw new NotFoundException(MESSAGES.PLACE_NOT_FOUND);
      }
      throw e;
    }
  }
  // #endregion

  // #region remove
  async remove(id: number): Promise<void> {
    const place = await this.prisma.placeProfile.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!place) {
      throw new NotFoundException(MESSAGES.PLACE_NOT_FOUND);
    }

    await this.prisma.$transaction(async tx => {
      // Soft delete place profile
      await tx.placeProfile.update({
        where: {
          id: place.id,
        },
        data: {
          isDeleted: true,
        },
      });

      // Soft delete related locations
      await tx.placeLocation.updateMany({
        where: {
          placeId: place.id,
        },
        data: {
          isDeleted: true,
        },
      });
    });
  }
  // #endregion
}
