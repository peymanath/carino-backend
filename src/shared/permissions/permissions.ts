export const PERMISSIONS = {
  // User
  USERS_CREATE: 'users.create',
  USERS_READ: 'users.read',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',

  // Profile
  PROFILE_READ: 'profile.read',
  PROFILE_UPDATE: 'profile.update',
  PROFILE_UPLOAD_AVATAR: 'profile.upload.avatar',

  // Addresses
  ADDRESSES_CREATE: 'addresses.create',
  ADDRESSES_READ: 'addresses.read',
  ADDRESSES_UPDATE: 'addresses.update',
  ADDRESSES_DELETE: 'addresses.delete',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
