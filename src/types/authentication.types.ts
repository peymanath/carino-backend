/**
 *
 */
export interface ISessionToken {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  exp: number;
}
