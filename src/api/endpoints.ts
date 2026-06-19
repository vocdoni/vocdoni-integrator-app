export enum ApiEndpoints {
  // Auth
  Login = 'auth/login',
  Refresh = 'auth/refresh',
  Register = 'users',
  Me = 'users/me',
  Verify = 'users/verify',
  VerifyCode = 'users/verify/code',
  PasswordRecovery = 'users/password/recovery',
  PasswordReset = 'users/password/reset',
  // Integrator (saas-backend#525)
  Integrator = 'organizations/{address}/integrator',
  ManagedOrganizations = 'organizations/{address}/managed',
}

export enum ErrorCode {
  // HTTP
  BadRequest = 400,
  Unauthorized = 401,
  // Custom API error codes
  MalformedJSONBody = 40004,
  UserNotVerified = 40014,
  UserAlreadyVerified = 40015,
  NotAnIntegrator = 40153,
  MaxManagedOrgsReached = 40154,
  IntegratorQuotaExceeded = 40155,
}
