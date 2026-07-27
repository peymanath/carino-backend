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
  {
    name: 'Profile',
    permissions: [
      {
        key: PERMISSIONS.PROFILE_READ,
        name: 'Read Profile',
      },
      {
        key: PERMISSIONS.PROFILE_UPDATE,
        name: 'Update Profile',
      },
      {
        key: PERMISSIONS.PROFILE_UPLOAD_AVATAR,
        name: 'Upload Avatar Profile',
      },
    ],
  },
  {
    name: 'Address',
    permissions: [
      {
        key: PERMISSIONS.ADDRESSES_CREATE,
        name: 'Create Address',
      },
      {
        key: PERMISSIONS.ADDRESSES_READ,
        name: 'Read Address',
      },
      {
        key: PERMISSIONS.ADDRESSES_UPDATE,
        name: 'Update Address',
      },
      {
        key: PERMISSIONS.ADDRESSES_DELETE,
        name: 'Delete Address',
      },
    ],
  },
  {
    name: 'Places',
    permissions: [
      {
        key: PERMISSIONS.PLACES_CREATE,
        name: 'Create Places',
      },
      {
        key: PERMISSIONS.PLACES_READ,
        name: 'Read Places',
      },
      {
        key: PERMISSIONS.PLACES_UPDATE,
        name: 'Update Places',
      },
      {
        key: PERMISSIONS.PLACES_DELETE,
        name: 'Delete Places',
      },
    ],
  },
] as const;