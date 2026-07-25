import { SetMetadata } from "@nestjs/common";
import { PermissionKey } from "../permissions/permissions";

export const DECORATOR_PERMISSIONS_KEY = "permissions";
export const Permissions = (...permissions: PermissionKey[]) => SetMetadata(DECORATOR_PERMISSIONS_KEY, permissions);
