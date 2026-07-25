import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreatePermissionDto } from "./create-permission.dto";
import { IsNotEmpty, IsNumber } from "class-validator";

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
