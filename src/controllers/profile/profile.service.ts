import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../modules/database/prisma.service';
import { StandardResponseDto } from '../../shared/dto';
import { ProfileDto, ProfileImageUploadDto } from './interface/profile.interface';
import { UpdateProfileDto } from './dto/profile.dto';
import { MESSAGES } from '../../shared/errors';
import { StorageService } from '../../modules/storage/storage.service';
import { EnumStorageBucket } from '../../modules/storage/enums/storage.enum';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService
  ) {}

  async findProfile(userId: number): Promise<StandardResponseDto<ProfileDto>> {
    if (!userId) {
      throw new BadRequestException(MESSAGES.USER_REQUIRED_ID);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            media: true,
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException(MESSAGES.PROFILE_NOT_FOUND);
    }

    const mapProfile: ProfileDto = {
      firstName: user.profile?.firstName,
      lastName: user.profile?.lastName,
      email: user.profile?.email,
      // avatarId: user.profile?.avatarId,
      mobile: user.mobile,
      avatarUrl: user.profile?.media?.url,
      birthDate: user.profile?.birthDate,
    };

    return new StandardResponseDto({
      data: mapProfile,
      message: MESSAGES.RECEIVED_DATA,
    });
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<StandardResponseDto<void>> {
    if (!userId) {
      throw new BadRequestException(MESSAGES.USER_REQUIRED_ID);
    }

    if (dto.avatarId) {
      const avatar = await this.prisma.media.findUnique({
        where: { id: dto.avatarId },
      });

      if (!avatar) {
        throw new BadRequestException(MESSAGES.MEDIA_AVATAR_NOT_FOUND);
      }
    }

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        profile: {
          update: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            ...(dto.avatarId && { avatarId: dto.avatarId }),
          },
        },
      },
    });

    return new StandardResponseDto({
      message: MESSAGES.PROFILE_UPDATED,
    });
  }
  async uploadImageProfile(userId: number, file: Express.Multer.File): Promise<StandardResponseDto<ProfileImageUploadDto>> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const media = await this.storage.uploadAndRegisterMedia(
      {
        bucket: EnumStorageBucket.Profile,
        userId: userId,
        file,
        isPublic: true,
        mimeType: file.mimetype,
      },
      {
        allowedMimeTypes: ['image/png', 'image/jpeg'],
        expectedSize: 1,
      }
    );

    return new StandardResponseDto({
      message: MESSAGES.PROFILE_UPDATED,
      data: {
        id: media.id,
        url: media.url,
      },
    });
  }
}
