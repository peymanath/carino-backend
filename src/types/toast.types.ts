export type TToastType = 'success' | 'error' | 'info' | 'warning';
export type TToastPosition = 'right-top' | 'right-bottom' | 'left-top' | 'left-bottom';

export interface IToast {
  id: number;
  message: string;
  type?: TToastType;
  duration?: number;
}
export type TToast = Omit<IToast, 'id'>;

export interface ToastStore {
  toasts: IToast[];
  addToast: (toast: TToast) => void;
  removeToast: (id: number) => void;
}
