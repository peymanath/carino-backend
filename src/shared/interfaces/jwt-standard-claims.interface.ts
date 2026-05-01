export interface JwtStandardClaims {
  // Subject (e.g., user ID).
  sub?: string | number;
  // Issuer.
  iss?: string;
  // Audience.
  aud?: string | string[];
  // Expiration time (seconds since epoch).
  exp?: number;
  // Issued at (seconds since epoch).
  iat?: number;
  // Not before (seconds since epoch).
  nbf?: number;
  // JWT ID.
  jti?: string;
}
