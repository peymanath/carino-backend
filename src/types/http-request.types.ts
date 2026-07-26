import { Problem } from './problem.interface.js';

export interface IRequestInit<TModel extends object = object> extends RequestInit {
  onSuccess?: (response: TModel) => void;
  onFail?: (error: Problem) => void;
  noAuth?: boolean;
  dangerBaseUrl?: string;
  userAgent?: string;
}
