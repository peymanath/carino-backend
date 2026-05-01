import { CreateUserProfileDto } from '@/modules/users/dto';
import { Gender } from '@/types';
import { ApiProperty } from '@nestjs/swagger';

export class AuthCompleteProfileDto extends CreateUserProfileDto {}

export class AuthCompleteProfileResultDto {
  @ApiProperty({
    description: 'First Name',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last Name',
  })
  lastName: string;

  @ApiProperty({
    description: 'Email',
  })
  email: string;

  @ApiProperty({
    description: 'Gender',
  })
  gender: Gender;

  @ApiProperty({
    description: 'Birthdate',
  })
  birthDate: Date | null;
}
