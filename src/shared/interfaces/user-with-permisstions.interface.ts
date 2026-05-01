import { User } from "@prisma/client";

export interface UserWithPermissions extends User {
  permissions: { key: string }[];
}
