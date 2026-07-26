import { ArrayUnique, IsArray, IsInt, Min } from 'class-validator';

export class AssignPermissionsDto {
  @IsInt()
  @Min(1)
  userId: number;

  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  permissionIds: number[];
}
