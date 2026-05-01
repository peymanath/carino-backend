import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, ArrayUnique, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, IsNumber } from "class-validator";

export class CreatePermissionDto {
  @ApiProperty({ example: "users.read" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  key: string;

  @ApiProperty({ example: "Read Users" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name: string;

  @ApiPropertyOptional({
    type: Number,
    example: 1,
    description: "PermissionCategory ID to link"
  })
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;
}
