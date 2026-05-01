import { OperationResult, StandardResponseDto } from './operation-result.interface.js';

export type UploadStatus = 'idle' | 'dragging' | 'validating' | 'uploading' | 'success' | 'error';

export interface IUseUploaderOptions<TResponse> {
  accept?: string[];
  /**
   * MegaByte => MB
   */
  maxSize?: number;
  multiple?: boolean;
  uploadAction: (file: File) => Promise<OperationResult<StandardResponseDto<TResponse>>>;
  onSuccess?: (data?: TResponse) => void;
  onFail?: (data?: OperationResult<StandardResponseDto<TResponse>>) => void;
}

export interface IUploaderError {
  code: UploaderErrorCode;
  message: string;
}

export interface IUploaderState {
  status: UploadStatus;
  mimeType?: 'image' | 'file';
  urls?: string[];
  error?: IUploaderError;
}

export interface IUploaderProps<TResponse> extends IUseUploaderOptions<TResponse> {
  defaultValue?: {
    url?: string;
    id?: number;
    type?: string;
  };
  onSuccess?: (data?: TResponse) => void;
  onFail?: (data?: OperationResult<StandardResponseDto<TResponse>>) => void;
}

export type UploaderErrorCode = 'INVALID_TYPE' | 'FILE_TOO_LARGE' | 'UPLOAD_FAILED' | 'UNKNOWN';
