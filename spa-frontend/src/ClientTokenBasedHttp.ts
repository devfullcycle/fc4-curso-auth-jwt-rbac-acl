type TokenResponse = {
  access_token: string;
  refresh_token: string;
}

export class ClientTokenBasedHttp {
  accessToken: string | null = null
  refreshToken: string | null = null
  baseURL: string

  constructor(options: { baseURL: string; accessToken?: string; refreshToken?: string; }) {
    this.baseURL = options.baseURL;
    this.accessToken = options.accessToken || null;
    this.refreshToken = options.refreshToken || null;
  }

  async login(email: string, password: string): Promise<TokenResponse> {
    const response = await fetch(`${this.baseURL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      throw new Error('Login failed')
    }

    const tokens: TokenResponse = await response.json() as TokenResponse
    this.accessToken = tokens.access_token
    this.refreshToken = tokens.refresh_token
    return tokens;
  }

  static isTokenExpiring(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expirationTime = payload.exp * 1000 // Convert to milliseconds
      const currentTime = Date.now()
      const timeUntilExpiration = expirationTime - currentTime

      // Return true if token will expire in less than 30 seconds
      return timeUntilExpiration <= 30000
    } catch {
      return true
    }
  }

  async doRefreshToken(): Promise<TokenResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch(`${this.baseURL}/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.refreshToken}`,
      },
    })

    if (!response.ok) {
      this.clearToken();
      throw new Error('Failed to refresh token')
    }

    const tokens: TokenResponse = await response.json() as TokenResponse
    this.accessToken = tokens.access_token
    this.refreshToken = tokens.refresh_token;
    return tokens;
  }

  private async makeRequest<T = any>(
    path: string,
    config: RequestInit = {},
    requiresAuth: boolean = true,
  ): Promise<T> {
    if (requiresAuth) {
      if (!this.accessToken) {
        throw new Error('No access token available')
      }

      if (ClientTokenBasedHttp.isTokenExpiring(this.accessToken)) {
        await this.doRefreshToken()
      }

      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.accessToken}`,
      }
    }

    const response = await fetch(`${this.baseURL}${path}`, config)

    if (response.status === 401 && requiresAuth) { //token expired
      try {
        await this.doRefreshToken()
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${this.accessToken}`,
        }
        const retryResponse = await fetch(`${this.baseURL}${path}`, config)
        if (!retryResponse.ok) {
          throw new Error('Request failed after token refresh')
        }
        return retryResponse.json() as T
      } catch (error) {
        throw new Error('Authentication failed')
      }
    }

    if (!response.ok) {
      throw new Error('Request failed')
    }

    return response.json() as T
  }

  async request<T = any>(
    path: string,
    config: RequestInit = {},
    requiresAuth: boolean = true,
  ): Promise<T> {
    return this.makeRequest(path, config, requiresAuth)
  }

  async get<T = any>(
    path: string,
    config: RequestInit = {},
    requiresAuth: boolean = true,
  ): Promise<T> {
    return this.makeRequest(path, { ...config, method: 'GET' }, requiresAuth)
  }

  async post<T = any>(
    path: string,
    data?: any,
    config: RequestInit = {},
    requiresAuth: boolean = true,
  ): Promise<T> {
    const conf = {
      ...config,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      body: JSON.stringify(data),
    }
    return this.makeRequest(path, conf, requiresAuth)
  }

  isAuthenticated(): boolean {
    return this.accessToken !== null
  }

  clearToken(): void {
    this.accessToken = null
    this.refreshToken = null
  }
}
