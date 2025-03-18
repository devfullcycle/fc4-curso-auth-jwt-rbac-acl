import { Repository } from "typeorm";
import { User } from "../entities/User";
import jwt from "jsonwebtoken";
import {
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  NotFoundError,
} from "../errors";
import { createDatabaseConnection } from "../database";

export class AuthenticationService {
  constructor(private userRepository: Repository<User>) {}

  async login(
    email: string,
    password: string
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user || !user.comparePassword(password)) {
      throw new InvalidCredentialsError();
    }
    const accessToken = AuthenticationService.generateAccessToken(user);
    const refreshToken = AuthenticationService.generateRefreshToken(user);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  static generateAccessToken(user: User): string {
    return jwt.sign(
      { name: user.name, email: user.email, roles: user.roles },
      process.env.JWT_PRIVATE_KEY as string,
      {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN as any,
        subject: user.id + "",
        algorithm: 'RS256'
      }
    );
  }

  static verifyAccessToken(token: string): {
    sub: string;
    name: string;
    email: string;
    roles: string[];
    iat: number;
    exp: number;
  } {
    return jwt.verify(token, process.env.JWT_PUBLIC_KEY as string, {
      algorithms: ["RS256"],
    }) as {
      sub: string;
      name: string;
      email: string;
      roles: string[];
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
        algorithm: 'RS256'
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
      const payload = AuthenticationService.verifyRefreshToken(refreshToken);
      const user = await this.userRepository.findOne({
        where: { id: +payload.sub },
      });
      if (!user) {
        throw new NotFoundError({ message: "User not found" });
      }
      const newAccessToken = AuthenticationService.generateAccessToken(user!);
      const newRefreshToken = AuthenticationService.generateRefreshToken(user!);
      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (e) {
      throw new InvalidRefreshTokenError({ options: { cause: e } });
    }
  }
}

export async function createAuthenticationService(): Promise<AuthenticationService> {
  const { userRepository } = await createDatabaseConnection();
  return new AuthenticationService(userRepository);
}
