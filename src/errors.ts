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

export class InvalidCredentialsError extends Error {
  constructor(params?: { message?: string; options?: ErrorOptions }) {
    super(params?.message ?? "Invalid credentials", params?.options);
    this.name = "InvalidCredentialsError";
  }
}
