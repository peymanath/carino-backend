import { Controller, Get, Body, HttpCode, HttpStatus, Put, Req, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { StandardResponseDto } from '../../shared/dto';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/profile.dto';
import { ProfileDto, ProfileImageUploadDto } from './interface/profile.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { HasAuthentication } from '../../shared/decorators/auth-swagger.decorator';
import { Permissions } from 'src/shared/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/shared/permissions/permissions';

@HasAuthentication()
@ApiTags("Site Profile")
@Controller('profile')
export class ProfileController {
  constructor(private readonly usersService: ProfileService) {}

  @Get()
  @Permissions(PERMISSIONS.PROFILE_READ)
  async findProfile(@Req() req: Request): Promise<StandardResponseDto<ProfileDto>> {
    return this.usersService.findProfile(req.user.id);
  }

  @Put()
   @Permissions(PERMISSIONS.PROFILE_UPDATE)
  @HttpCode(HttpStatus.CREATED)
  async updateProfile(@Body() dto: UpdateProfileDto, @Req() req: Request): Promise<StandardResponseDto<void>> {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Post('upload')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Permissions(PERMISSIONS.PROFILE_UPLOAD_AVATAR)
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    })
  )
  async uploadImageProfile(@UploadedFile() file: Express.Multer.File, @Req() req: Request): Promise<StandardResponseDto<ProfileImageUploadDto>> {
    return this.usersService.uploadImageProfile(req.user.id, file);
  }
}
