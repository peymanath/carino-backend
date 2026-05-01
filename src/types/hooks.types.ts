import { OperationResult, StandardResponseDto } from './operation-result.interface.js';

// #region ============================ usePasskeyAuth =====================================
export interface PasskeyHookProps<TResult extends unknown> {
  onRegisterOptionsRequest?: () => Promise<OperationResult<StandardResponseDto<PasskeyRegisterOptions>>>;
  onRegisterVerifyRequest?: (signedData: PasskeyRegisterVerifyModel) => Promise<OperationResult<StandardResponseDto<void>>>;
  onLoginOptionsRequest?: () => Promise<OperationResult<StandardResponseDto<PasskeyLoginOptions>>>;
  onLoginVerifyRequest?: (signedData: PasskeyLoginVerify) => Promise<OperationResult<StandardResponseDto<TResult>>>;
  onSuccess: (result: OperationResult<StandardResponseDto<TResult>> | undefined) => void;
  onError: (error: string) => void;
}
export interface PasskeyLoginOptions {
  challenge: string;
  rpId?: string;
  timeout?: number;
  userVerification?: UserVerificationRequirement;
  allowCredentials?: Array<{
    id: string;
    type: 'public-key';
    transports?: AuthenticatorTransport[];
  }>;
}
export interface PasskeyLoginVerify {
  id: string;
  rawId: string;
  type: 'public-key';
  response?: {
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
    userHandle: string | null;
  };
  clientExtensionResults?: Record<string, unknown>;
  authenticatorAttachment?: string | null;
}
export interface PasskeyRegisterOptions {
  challenge: string;
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: 'public-key';
    alg: number;
  }>;
  timeout?: number;
  attestation?: 'none' | 'indirect' | 'direct';
  excludeCredentials?: Array<{
    id: string;
    type: 'public-key';
  }>;
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  extensions?: AuthenticationExtensionsClientInputs;
}
export interface PasskeyRegisterVerifyModel {
  id: string;
  rawId: string;
  type: 'public-key';
  response: {
    clientDataJSON: string;
    attestationObject: string;
    transports?: string[];
  };
  authenticatorAttachment?: string;
  clientExtensionResults?: Record<string, any>;
}
// #endregion
