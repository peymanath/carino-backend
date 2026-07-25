import { ApiProperty } from "@nestjs/swagger";

export class PermissionCategoryDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
}
