export class CategoryPermissionsDto {
  categoryId: number;
  categoryName: string;
  permissions: Array<PermissionDto>;
}

export class PermissionDto {
  id: number;
  key: string;
  name: string;
}
