import { Controller, Get, Body, HttpCode, HttpStatus, Put, Req, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { StandardResponseDto } from '@/shared/dto';
import { ApiBody, ApiConsumes, ApiOkResponse } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/profile.dto';
import { ProfileDto, ProfileImageUploadDto } from './interface/profile.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { HasAuthentication } from '@/shared/decorators/auth-swagger.decorator';

@HasAuthentication()
@Controller('profile')
export class ProfileController {
  constructor(private readonly usersService: ProfileService) {}

  @Get()
  // Todo: @Permissions('profile.read')
  async findProfile(@Req() req: Request): Promise<StandardResponseDto<ProfileDto>> {
    return this.usersService.findProfile(req.user.id);
  }

  @Put()
  // Todo: @Permissions('profile.create')
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
  @ApiOkResponse({
    description: 'Upload Image for profile user',
    type: ProfileImageUploadDto,
  })
  // Todo: @Permissions('profile.create')
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
