import { Repository } from "typeorm";
import { User } from "../entities/User";
import jwt from "jsonwebtoken";
import {
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  NotFoundError,
} from "../errors";
import { createDatabaseConnection } from "../database";
import { defineAbilityFor } from "../permissions";
import { packRules } from "@casl/ability/extra";
import {
  BlockListTokenService,
  createBlockListTokenService,
} from "./BlockListTokenService";
import crypto from "crypto";

export class AuthenticationService {
  constructor(
    private userRepository: Repository<User>,
    private blockListTokenService: BlockListTokenService
  ) {}

  async login(
    email: string,
    password: string
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user || !user.comparePassword(password)) {
      throw new InvalidCredentialsError();
    }
    const ability = defineAbilityFor(user);
    const permissions = packRules(ability.rules);
    const accessToken = AuthenticationService.generateAccessToken(
      user,
      permissions
    );
    const refreshToken = AuthenticationService.generateRefreshToken(user);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  static generateAccessToken(user: User, permissions: any): string {
    return jwt.sign(
      { name: user.name, email: user.email, roles: user.roles, permissions },
      process.env.JWT_PRIVATE_KEY as string,
      {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN as any,
        subject: user.id + "",
        algorithm: "RS256",
        jwtid: crypto.randomUUID(),
      }
    );
  }

  static verifyAccessToken(token: string): {
    sub: string;
    name: string;
    email: string;
    roles: string[];
    permissions: any[];
    iat: number;
    exp: number;
  } {
    return jwt.verify(token, process.env.JWT_PUBLIC_KEY as string, {
      algorithms: ["RS256"],
      clockTolerance: 60,
    }) as {
      sub: string;
      name: string;
      email: string;
      roles: string[];
      permissions: any[];
      iat: number;
      exp: number;
    };
  }

  static generateRefreshToken(user: User): string {
    return jwt.sign(
      { name: user.name, email: user.email, roles: user.roles },
      process.env.JWT_PRIVATE_KEY as string,
      {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as any,
        subject: user.id + "",
        algorithm: "RS256",
        jwtid: crypto.randomUUID(), //uuid v4
      }
    );
  }

  static verifyRefreshToken(token: string): {
    sub: string;
    name: string;
    email: string;
    roles: string[];
    iat: number;
    exp: number;
  } {
    return jwt.verify(token, process.env.JWT_PUBLIC_KEY as string, {
      algorithms: ["RS256"],
      clockTolerance: 60,
    }) as {
      sub: string;
      name: string;
      email: string;
      roles: string[];
      iat: number;
      exp: number;
    };
  }

  async doRefreshToken(refreshToken: string) {
    try {
      // Verificar se o token está na blocklist
      const isBlocked = await this.blockListTokenService.isBlocked(
        refreshToken
      );
      if (isBlocked) {
        throw new Error("Token is blacklisted");
      }

      const payload = AuthenticationService.verifyRefreshToken(refreshToken);
      const user = await this.userRepository.findOne({
        where: { id: +payload.sub },
      });
      if (!user) {
        throw new NotFoundError({ message: "User not found" });
      }
      const ability = defineAbilityFor(user);
      const permissions = packRules(ability.rules);
      const newAccessToken = AuthenticationService.generateAccessToken(
        user!,
        permissions
      );
      const newRefreshToken = AuthenticationService.generateRefreshToken(user!);

      // Invalidar o token antigo após a renovação (não permanentemente)
      await this.blockListTokenService.invalidateToken(refreshToken, false);

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (e) {
      throw new InvalidRefreshTokenError({ options: { cause: e } });
    }
  }

  /**
   * Verifica se um token está na blocklist
   */
  async isTokenBlocked(token: string): Promise<boolean> {
    return this.blockListTokenService.isBlocked(token);
  }

  /**
   * Adiciona um token à blocklist
   */
  async invalidateToken(
    token: string,
    forever: boolean = false
  ): Promise<boolean> {
    return this.blockListTokenService.invalidateToken(token, forever);
  }

  /**
   * Invalida os tokens de acesso e refresh no logout
   */
  async logout(accessToken?: string, refreshToken?: string): Promise<void> {
    if (accessToken) {
      await this.blockListTokenService.invalidateToken(accessToken, true);
    }

    if (refreshToken) {
      await this.blockListTokenService.invalidateToken(refreshToken, true);
    }
  }
}

export async function createAuthenticationService(): Promise<AuthenticationService> {
  const { userRepository } = await createDatabaseConnection();
  const blockListTokenService = await createBlockListTokenService();
  return new AuthenticationService(userRepository, blockListTokenService);
}
