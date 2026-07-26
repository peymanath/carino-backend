import { CreateUserProfileDto } from '../../users/dto';
import { Gender } from '../../../types';

export class AuthCompleteProfileDto extends CreateUserProfileDto {}

export class AuthCompleteProfileResultDto {
  firstName: string;
  lastName: string;
  email: string;
  gender: Gender;
  birthDate: Date | null;
}
