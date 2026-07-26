import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../modules/database/prisma.service';
import { StandardResponseDto } from '../../shared/dto';
import { DDLResultDto } from './dto/ddl.dto';
import { CityQueryDDLDto, ProvinceQueryDDLDto } from './dto/query-ddl.dto';

@Injectable()
export class DdlService {
  constructor(private readonly prisma: PrismaService) {}

  // #region countries
  async countries(): Promise<StandardResponseDto<DDLResultDto[]>> {
    const data = await this.prisma.country.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return new StandardResponseDto({
      data: data.map(item => ({
        name: item.name,
        value: item.id,
      })),
    });
  }
  // #endregion

  // #region provinces
  async provinces(query: ProvinceQueryDDLDto): Promise<StandardResponseDto<DDLResultDto[]>> {
    const data = await this.prisma.province.findMany({
      where: {
        ...(query.countryId ? { countryId: query.countryId } : {}),
      },

      orderBy: {
        name: 'asc',
      },
    });

    return new StandardResponseDto({
      data: data.map(item => ({
        name: item.name,
        value: item.id,
        ...(!query.countryId
          ? {
              additional: {
                countryId: item.countryId,
              },
            }
          : {}),
      })),
    });
  }
  // #endregion

  // #region cities
  async cities(query: CityQueryDDLDto): Promise<StandardResponseDto<DDLResultDto[]>> {
    const data = await this.prisma.city.findMany({
      where: {
        ...(query.provinceId ? { provinceId: query.provinceId } : {}),
      },

      orderBy: {
        name: 'asc',
      },
    });

    return new StandardResponseDto({
      data: data.map(item => ({
        name: item.name,
        value: item.id,
        ...(!query.provinceId
          ? {
              additional: {
                provinceId: item.provinceId,
              },
            }
          : {}),
      })),
    });
  }
  // #endregion
}
