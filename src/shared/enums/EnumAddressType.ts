export enum EnumAddressType {
  Home = 1, // خانه
  Work = 2, // محل کار
  Company = 3, // شرکت
  Family = 4, // منزل خانواده
  Friend = 5, // منزل دوستان
  Other = 6, // سایر
}

export const AddressTypeLabels: Record<EnumAddressType, string> = {
  [EnumAddressType.Home]: 'خانه',
  [EnumAddressType.Work]: 'محل کار',
  [EnumAddressType.Company]: 'شرکت',
  [EnumAddressType.Family]: 'منزل خانواده',
  [EnumAddressType.Friend]: 'منزل دوستان',
  [EnumAddressType.Other]: 'سایر',
};
