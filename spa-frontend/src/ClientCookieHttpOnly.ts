/* eslint-disable @typescript-eslint/no-explicit-any */
export type TokenResponse = {
    access_token: string
    refresh_token: string
  }
  
  export class ClientCookieHttpOnly {
    public accessTokenExpiryTime: number = 0
    public refreshTokenExpiryTime: number = 0
    public baseURL: string
  
    constructor(options: {
      baseURL: string
      accessTokenExpiryTime?: number
      refreshTokenExpiryTime?: number
    }) {
      this.baseURL = options.baseURL
      this.accessTokenExpiryTime = options.accessTokenExpiryTime || 0
      this.refreshTokenExpiryTime = options.refreshTokenExpiryTime || 0
    }
  
    isAccessTokenExpiring(): boolean {
      if (this.accessTokenExpiryTime === 0) {
        return true
      }
      const timeUntilExpiration = this.accessTokenExpiryTime - Date.now()
      return timeUntilExpiration <= 30000
    }
  
    isRefreshTokenExpiring(): boolean {
      if (this.refreshTokenExpiryTime === 0) {
        return true
      }
      const timeUntilExpiration = this.refreshTokenExpiryTime - Date.now()
      return timeUntilExpiration <= 30000
    }
  
    updateAccessTokenExpiry(token: string): void {
      const payload = JSON.parse(atob(token.split('.')[1]))
      this.accessTokenExpiryTime = payload.exp * 1000
    }
  
    updateRefreshTokenExpiry(token: string): void {
      const payload = JSON.parse(atob(token.split('.')[1]))
      this.refreshTokenExpiryTime = payload.exp * 1000
    }
  
    clearTokenExpiry(): void {
      this.accessTokenExpiryTime = 0
      this.refreshTokenExpiryTime = 0
    }
  
    async login(email: string, password: string): Promise<TokenResponse> {
      const data = await this.post<TokenResponse>('/login', { email, password }, {}, false)
  
      this.updateAccessTokenExpiry(data.access_token)
      this.updateRefreshTokenExpiry(data.refresh_token)
  
      return data
    }
  
    async logout(): Promise<void> {
      await fetch(`${this.baseURL}/logout`, {
        method: 'POST',
        credentials: 'include',
      })
  
      this.clearTokenExpiry()
    }
  
    async doRefreshToken(): Promise<TokenResponse> {
      const data = await this.post<TokenResponse>('/refresh-token', {}, {}, false)
      this.updateAccessTokenExpiry(data.access_token)
      this.updateRefreshTokenExpiry(data.refresh_token)
  
      return data
    }
  
    protected async makeRequest<T = any>(path: string, config: RequestInit = {}, requiresAuth: boolean = true): Promise<T> {
      if (requiresAuth) {
        if (this.isAccessTokenExpiring()) {
          await this.doRefreshToken()
        }
      }

      const newConfig = this.applyCsrfToken(config)
  
      const response = await fetch(`${this.baseURL}${path}`, {
        ...newConfig,
        credentials: 'include',
      })
  
      if(response.status === 401 && requiresAuth) { //verificar se o erro é de token expirado
        try {
          await this.doRefreshToken()
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
        const error = await response.json().catch(() => ({ message: 'Request failed' }))
        throw new Error(error.message)
      }
  
      if (response.status === 204) {
        return null as unknown as T
      }
  
      return response.json()
    }
  
    async get<T = any>(path: string, config: RequestInit = {}, requiresAuth: boolean = true): Promise<T> {
      return this.makeRequest(path, { ...config, method: 'GET' }, requiresAuth)
    }
  
    async post<T = any>(path: string, data?: any, config: RequestInit = {}, requiresAuth: boolean = true): Promise<T> {
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

    applyCsrfToken(config: RequestInit): RequestInit {
      const isInsecureMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase() || '')
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
      if (isInsecureMethod && csrfToken) {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-CSRF-Token': decodeURIComponent(csrfToken), 
          },
        }
      }
      return config
    }
  }
  