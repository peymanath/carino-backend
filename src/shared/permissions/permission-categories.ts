import { PERMISSIONS } from './permissions';

export const PERMISSION_CATEGORIES = [
  {
    name: 'Users',
    permissions: [
      {
        key: PERMISSIONS.USERS_CREATE,
        name: 'Create User',
      },
      {
        key: PERMISSIONS.USERS_READ,
        name: 'Read User',
      },
      {
        key: PERMISSIONS.USERS_UPDATE,
        name: 'Update User',
      },
      {
        key: PERMISSIONS.USERS_DELETE,
        name: 'Delete User',
      },
    ],
  },
] as const;