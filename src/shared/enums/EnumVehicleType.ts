export enum EnumVehicleType {
  Other = 0, // سایر
  PassengerCar = 1, // خودروی سواری
  Motorcycle = 2, // موتورسیکلت
  HeavyTruck = 3, // کامیون و کشنده
  Bus = 4, // اتوبوس و مینی‌بوس
  Van = 5, // ون
  Pickup = 6, // وانت
  Agricultural = 7, // ماشین‌آلات کشاورزی
  Construction = 8, // ماشین‌آلات راهسازی و عمرانی
  ElectricCar = 9, // خودروی برقی
  HybridCar = 10, // خودروی هیبریدی
  Caravan = 11, // کاروان و کمپر
  Trailer = 12, // تریلر و یدک
}

export const VehicleTypeLabels: Record<EnumVehicleType, string> = {
  [EnumVehicleType.PassengerCar]: 'خودروی سواری',
  [EnumVehicleType.Motorcycle]: 'موتورسیکلت',
  [EnumVehicleType.HeavyTruck]: 'کامیون و کشنده',
  [EnumVehicleType.Bus]: 'اتوبوس و مینی‌بوس',
  [EnumVehicleType.Van]: 'ون',
  [EnumVehicleType.Pickup]: 'وانت',
  [EnumVehicleType.Agricultural]: 'ماشین‌آلات کشاورزی',
  [EnumVehicleType.Construction]: 'ماشین‌آلات راهسازی و عمرانی',
  [EnumVehicleType.ElectricCar]: 'خودروی برقی',
  [EnumVehicleType.HybridCar]: 'خودروی هیبریدی',
  [EnumVehicleType.Caravan]: 'کاروان و کمپر',
  [EnumVehicleType.Trailer]: 'تریلر و یدک',
  [EnumVehicleType.Other]: 'سایر',
};


