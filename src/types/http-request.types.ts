import { Problem } from './problem.interface.js';

export interface IRequestInit<TModel extends {} | unknown = unknown> extends RequestInit {
  onSuccess?: (response: TModel) => void;
  onFail?: (error: Problem) => void;
  noAuth?: boolean;
  dangerBaseUrl?: string;
  userAgent?: string;
}
