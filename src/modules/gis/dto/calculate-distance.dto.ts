import type { ICoordinate } from '../interfaces';
import { EnumDistanceUnit } from '../enums/distance-unit.enum';

export class CalculateDistanceDto {
  from: ICoordinate;
  to: ICoordinate;
  unit?: EnumDistanceUnit;
}
