import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, ArrayUnique, IsArray, IsInt, Min } from "class-validator";

export class AssignPermissionsDto {
  @ApiProperty({ example: 123 })
  @IsInt()
  @Min(1)
  userId: number;

  @ApiProperty({ type: [Number], example: [1, 2, 3] })
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  permissionIds: number[];
}