import { Router, Response } from "express";
import { createAuthenticationService } from "../services/AuthenticationService";
import { TokenExpiredError, TokenNotProvidedError } from "../errors";
import jwt from "jsonwebtoken";

const authRouter = Router();

authRouter.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const authService = await createAuthenticationService();
    const tokens = await authService.login(email, password);
    generateAccessTokenCookie(res, tokens.access_token);
    generateRefreshTokenCookie(res, tokens.refresh_token);
    res.json(tokens);
  } catch (e) {
    next(e);
  }
});

authRouter.post("/refresh-token", async (req, res, next) => {
  const refreshToken =
    req.body?.refresh_token ||
    req.headers.authorization?.replace("Bearer ", "") || 
    req.cookies?.refreshToken;

  if (!refreshToken) {
    next(new TokenNotProvidedError());
    return;
  }

  try {
    const authService = await createAuthenticationService();
    const tokens = await authService.doRefreshToken(refreshToken);
    generateAccessTokenCookie(res, tokens.access_token);
    generateRefreshTokenCookie(res, tokens.refresh_token);
    res.json(tokens);
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      return next(new TokenExpiredError({ options: { cause: e } }));
    }
    next(e);
  }
});

authRouter.post('/logout', async (req, res) => {
  try {
    // Identificar o access token
    const accessToken =
      req.body?.accessToken ||
      req.cookies?.accessToken;
    
    // Identificar o refresh token
    const refreshToken =
      req.body?.refreshToken ||
      req.cookies?.refreshToken;
    
    // Usar o AuthenticationService para logout
    const authService = await createAuthenticationService();
    await authService.logout(accessToken, refreshToken);
    
    // Limpa os cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(204).send();
  } catch (error) {
    console.error(error);
    // Em caso de erro, ainda limpa os cookies e retorna sucesso
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(204).send();
  }
})

export function generateAccessTokenCookie(res: Response, accessToken: string){
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    //secure: process.env.NODE_ENV === 'production',
    secure: true,
    sameSite: 'none',
    maxAge: 6000000, 
    path: '/'
  })
}

export function generateRefreshTokenCookie(res: Response, refreshToken: string){
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    //secure: process.env.NODE_ENV === 'production',
    secure: true,
    sameSite: 'none',
    maxAge: 604800000, // 7 days
    path: '/refresh-token'
  })
}

export { authRouter };
