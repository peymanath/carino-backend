import { ApiProperty } from '@nestjs/swagger';

export class ProfileDto {
  @ApiProperty({ example: 'firstName' })
  firstName?: string | null;

  @ApiProperty({ example: 'lastName' })
  lastName?: string | null;

  @ApiProperty({ example: 'info@email.com' })
  email?: string | null;

  @ApiProperty({ example: 'avatarUrl' })
  avatarUrl?: string;

  @ApiProperty({ example: 'mobile' })
  mobile: string;

  @ApiProperty({ example: 'birthDate' })
  birthDate?: Date | null;
}
export class ProfileImageUploadDto {
  @ApiProperty({ example: 0 })
  id: number;
  url: string;
}
