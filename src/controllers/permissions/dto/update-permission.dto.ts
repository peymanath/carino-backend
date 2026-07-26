import {  PartialType } from "@nestjs/swagger";
import { CreatePermissionDto } from "./create-permission.dto";
import { IsNotEmpty, IsNumber } from "class-validator";

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
