import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";

export class UpdatePermissionCategoryDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ example: "User Management" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name: string;
}
