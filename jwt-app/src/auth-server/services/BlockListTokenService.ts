import jwt from "jsonwebtoken";
import { createCacheService } from "./CacheService";

// Interface para o conteúdo armazenado no cache
interface TokenBlockInfo {
  expirationTime: number;
  forever: boolean;
}

const cacheService = createCacheService();

export class BlockListTokenService {
  constructor(private gracePeriod: number = 60) {}

  /**
   * Adiciona um token à blocklist
   * @param token O token JWT completo
   * @param forever Se true, o token será marcado como bloqueado permanentemente
   * @returns true se o token foi adicionado com sucesso
   */
  async invalidateToken(
    token: string,
    forever: boolean = false
  ): Promise<boolean> {
    //token, foverer

    //logout - access token e refresh token
    //refresh token - (tolerancia) 30s 60s
    try {
      const payload = jwt.decode(token) as jwt.JwtPayload;
      if (!payload || !payload.jti) {
        throw new Error("Invalid token format");
      }

      if (!payload.exp) {
        throw new Error("Token does not have an expiration time");
      }

      let blockInfo = (await cacheService.get(payload.jti)) as TokenBlockInfo;
      if (blockInfo) {
        return true; // Token já está na blocklist
      }

      const now = Math.floor(Date.now() / 1000); //timestamp

      const expirationTime = now + this.gracePeriod;

      blockInfo = {
        expirationTime,
        forever,
      };

      return cacheService.add(payload.jti, blockInfo, payload.exp);
    } catch (error) {
      console.error("Failed to add token to blocklist:", error);
      return false;
    }
  }

  /**
   * Método legado para compatibilidade
   * @deprecated Use invalidateToken instead
   */
  async addToken(token: string): Promise<boolean> {
    return this.invalidateToken(token, false);
  }

  /**
   * Verifica se um token está na blocklist
   * @param token O token JWT completo
   * @returns true se o token estiver na blocklist
   */
  async isBlocked(token: string): Promise<boolean> {
    try {
      const payload = jwt.decode(token) as jwt.JwtPayload;
      if (!payload || !payload.jti) {
        return true; // Se não podemos verificar, consideramos bloqueado
      }

      // Verificar se o token está na blocklist
      const blockInfo = (await cacheService.get(payload.jti)) as TokenBlockInfo;
      console.log("Block info:", blockInfo);
      if (!blockInfo) {
        return false; // Token não está na blocklist
      }

      // Primeiro verificamos se o token foi marcado como "forever"
      if (blockInfo.forever) {
        return true;
      }

      // Se não for forever, verificamos se o tempo de expiração ainda não passou
      console.log("Current time:", Math.floor(Date.now() / 1000));
      console.log("Expiration time:", blockInfo.expirationTime);
      return Math.floor(Date.now() / 1000) > blockInfo.expirationTime;
    } catch (error) {
      console.error("Error checking if token is blocked:", error);
      return true; // Se não podemos verificar, consideramos bloqueado
    }
  }
}

export async function createBlockListTokenService() {
  return new BlockListTokenService();
}
