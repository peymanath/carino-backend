import { SetMetadata } from "@nestjs/common";

export const DECORATOR_PERMISSIONS_KEY = "permissions";
export const Permissions = (...permissions: string[]) => SetMetadata(DECORATOR_PERMISSIONS_KEY, permissions);
