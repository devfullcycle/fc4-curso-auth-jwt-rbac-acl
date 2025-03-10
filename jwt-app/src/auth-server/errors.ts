export class TokenNotProvidedError extends Error {
  constructor(params?: { message?: string; options?: ErrorOptions }) {
    super(params?.message ?? "Token not provided", params?.options);
    this.name = "TokenNotProvidedError";
  }
}

export class InvalidAccessTokenError extends Error {
  constructor(params?: { message?: string; options?: ErrorOptions }) {
    super(params?.message ?? "Invalid access token", params?.options);
    this.name = "InvalidAccessTokenError";
  }
}

export class InvalidRefreshTokenError extends Error {
  constructor(params?: { message?: string; options?: ErrorOptions }) {
    super(params?.message ?? "Invalid refresh token", params?.options);
    this.name = "InvalidRefreshTokenError";
  }
}

export class InvalidCredentialsError extends Error {
  constructor(params?: { message?: string; options?: ErrorOptions }) {
    super(params?.message ?? "Invalid credentials", params?.options);
    this.name = "InvalidCredentialsError";
  }
}

export class TokenExpiredError extends Error {
  constructor(params?: { message?: string; options?: ErrorOptions }) {
    super(params?.message ?? "Token expired", params?.options);
    this.name = "TokenExpiredError";
  }
}

export class NotFoundError extends Error {
  constructor(params?: { message?: string; options?: ErrorOptions }) {
    super(params?.message ?? "Not found", params?.options);
    this.name = "NotFoundError";
  }
}