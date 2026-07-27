import { Controller } from '@nestjs/common';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  // @Post('upload')
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     required: ['file', 'bucket', 'userId'],
  //     properties: {
  //       file: {
  //         type: 'string',
  //         format: 'binary',
  //       },
  //       bucket: {
  //         type: 'string',
  //         enum: Object.values(EnumStorageBucket),
  //       },
  //       userId: {
  //         type: 'number',
  //         example: 1,
  //       },
  //       alt: {
  //         type: 'string',
  //         example: 'User avatar',
  //       },
  //       isPublic: {
  //         type: 'boolean',
  //         example: true,
  //       },
  //       mimeType: {
  //         type: 'string',
  //         example: 'image/png',
  //       },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Uploaded media',
  //   type: Object, // چون Media interface است
  // })
  // @UseInterceptors(FileInterceptor('file'))
  // async upload(@UploadedFile() file: any, @Body() body: any) {
  //   if (!file) {
  //     throw new BadRequestException(MESSAGES.STORAGE_FILE_REQUIRED);
  //   }

  //   const options: UploadAndRegisterMediaOption = {};

  //   const media = await this.storage.uploadAndRegisterMedia(
  //     {
  //       bucket: body.bucket,
  //       userId: Number(body.userId),
  //       file,
  //       alt: body.alt,
  //       isPublic: body.isPublic === 'true' || body.isPublic === true,
  //       mimeType: body.mimeType,
  //     },
  //     options
  //   );

  //   return new StandardResponseDto({ data: media });
  // }
}
