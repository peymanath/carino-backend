import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreatePermissionCategoryDto {
  @ApiProperty({ example: "User Management" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name: string;
}
