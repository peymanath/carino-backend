import { ApiProperty } from "@nestjs/swagger";

export class CategoryPermissionsDto {
  categoryId: number;
  categoryName: string;
  permissions: Array<PermissionDto>;
}

export class PermissionDto {
  @ApiProperty() id: number;
  @ApiProperty() key: string;
  @ApiProperty() name: string;
}
