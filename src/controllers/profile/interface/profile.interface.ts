

export class ProfileDto {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  avatarUrl?: string;
  mobile: string;
  birthDate?: Date | null;
}
export class ProfileImageUploadDto {
  id: number;
  url: string;
}
