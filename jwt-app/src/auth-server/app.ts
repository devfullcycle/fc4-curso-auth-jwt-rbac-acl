import express, { NextFunction } from "express";
import { loadFixtures } from "./fixtures";
import { logRequest, logResponse } from "../lib/log";
import { userRouter } from "./router/user-router";
import { AuthenticationService, createAuthenticationService } from "./services/AuthenticationService";
import dotenv from "dotenv";
import {
  InvalidAccessTokenError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  NotFoundError,
  TokenExpiredError,
  TokenNotProvidedError,
  UnauthorizedError,
} from "./errors";
import jwt from "jsonwebtoken";
import { createUserService } from "./services/UserService";
import { createCartService } from "./services/CartService";
import cors from "cors";
import { authRouter } from "./router/auth-router";
import cookieParser from "cookie-parser";
import { courseRouter } from "./router/course-router";
import { teacherRouter } from "./router/teacher-router";
import { studentRouter } from "./router/student-router";
import { defineAbilityFrom } from "./permissions";
import csrf from "csrf";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const csrfTokens = new csrf();
const secret = csrfTokens.secretSync();
const allowedOrigins = ["http://localhost:5173", "http://localhost:9000"];
app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials: true, origin: allowedOrigins}));
//log requests
app.use(logRequest);
//log responses headers
app.use(logResponse);

const protectedRoutes = ["/protected", "/users", '/teachers', '/students', '/courses'];

app.use((req, res, next) => {
  //https://my-spa.com/pagina1
    //Origin: https://my-spa.com
    //Referer: https://my-spa.com/pagina1/
  const origin = req.headers.origin; //origin e referer
  const referer = req.headers.referer?.replace(/\/$/, "");
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).send({ message: "Invalid Origin" });
  }
  
  if (referer && !allowedOrigins.some((allowedOrigin) => referer.startsWith(allowedOrigin))) {
    return res.status(403).send({ message: "Invalid Referer" });
  }

  if (req.url === "/csrf-token") { //não precisa de token CSRF
    return next();
  }
  //anti csrf attack
  const insecureMethods = ["POST", "PUT", "PATCH", "DELETE"]; //não seguros
  if (!insecureMethods.includes(req.method)) {
    return next();
  }
  // Verifica se o token CSRF é válido
  const accessToken = req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;
  const csrfTokenCookie = req.cookies?.["csrf-token"];
  const csrfTokenHeader = req.headers?.["x-csrf-token"];
  console.log("CSRF Token Header:", csrfTokenHeader);
  console.log("CSRF Token Cookie:", csrfTokenCookie);
  if (csrfTokenCookie && !csrfTokenHeader) {
    return res.status(403).send({ message: "CSRF token missing" });
  }
  if ((accessToken || refreshToken) && !csrfTokenHeader && !csrfTokenCookie) {
    return res.status(403).send({ message: "CSRF token missing" });
  }
  if (
    csrfTokenCookie &&
    csrfTokenCookie !== csrfTokenHeader &&
    csrfTokens.verify(secret, csrfTokenCookie)
  ) {
    return res.status(403).send({ message: "Invalid CSRF token" });
  }

  next();
  // Gera um novo token CSRF
  // const newCsrfToken = Math.random().toString(36).slice(2);
  // res.setHeader('X-CSRF-Token', newCsrfToken);
  // res.cookie("csrfSecret", newCsrfToken, {
  //   httpOnly: false,
  //   secure: true,
  //   sameSite: "none",
  //   signed: true,
  // });


});

app.use(async (req, res, next) => {
  const isProtectedRoute = protectedRoutes.some((route) =>
    req.url.startsWith(route)
  );

  if (!isProtectedRoute) {
    return next();
  }

  const accessToken =
    req.headers.authorization?.replace("Bearer ", "") ||
    req.cookies?.accessToken;

  if (!accessToken) {
    next(new TokenNotProvidedError());
    return;
  }

  try {
    const authService = await createAuthenticationService();
    // Verificar se o token está na blocklist
    const isBlocked = await authService.isTokenBlocked(accessToken);
    if (isBlocked) {
      return next(
        new InvalidAccessTokenError({ message: "Token is blacklisted" })
      );
    }

    const payload = AuthenticationService.verifyAccessToken(accessToken);
    const userService = await createUserService();
    const user = await userService.findById(+payload.sub);
    req.user = user!;
    //req.ability = defineAbilityFor(user!); //cache lru
    req.ability = defineAbilityFrom(payload.permissions); //banco de dados
    next();
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      return next(new TokenExpiredError({ options: { cause: e } }));
    }
    return next(new InvalidAccessTokenError({ options: { cause: e } }));
  }
});

// Middleware para o carrinho do usuário
app.use(async (req, res, next) => {
  if (!req.user) {
    return next();
  }
  const cartService = await createCartService();
  const cartToken = await cartService.generateCartToken(req.user.id);
  if (cartToken) {
    res.setHeader("X-Cart", cartToken);
  }
  next();
});

// Tratamento de erros para pre-middlewares
app.use(
  async (
    error: Error,
    req: express.Request,
    res: express.Response,
    next: NextFunction
  ) => {
    if (!error) {
      return next();
    }
    errorHandler(error, req, res, next);
  }
);

app.get("/protected", (req, res) => { //segura GET 
  res.status(200).json(req.user);
});
app.post("/protected", (req, res) => { //não segura POST
  res.status(200).json({message: 'Protected route'});
});

app.post("/csrf-token", (req, res) => {

  const token = csrfTokens.create(secret);
  console.log("CSRF Token:", token);
  res.cookie("csrf-token", token, {
    httpOnly: false, //https document.cookie = ''
    secure: true,
    sameSite: "none",
  });
  res.send({ csrfToken: token });
});

// Rotas da API
app.use("", authRouter);
app.use("", userRouter);
app.use("", courseRouter);
app.use("", teacherRouter);
app.use("", studentRouter);

//Tratamento de erros global da rotas da API
app.use(errorHandler);

app.listen(+PORT, "0.0.0.0", async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await loadFixtures();
});

function errorHandler(
  error: Error,
  req: express.Request,
  res: express.Response,
  next: NextFunction
) {
  if (!error) {
    return;
  }

  const errorDetails = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    cause: error.cause,
  };

  console.error(
    "Error details:",
    JSON.stringify(
      errorDetails,
      (key, value) => {
        // Se for a stack trace, formata com quebras de linha adequadas
        if (key === "stack" && typeof value === "string") {
          return value.split("\n").map((line) => line.trim());
        }
        return value;
      },
      2
    )
  );

  //some errors
  if (error instanceof TokenNotProvidedError) {
    res.status(401).send({ message: "Token not provided" });
    return;
  }

  if (error instanceof InvalidAccessTokenError) {
    res.status(401).send({ message: "Invalid access token" });
    return;
  }

  if(error instanceof InvalidRefreshTokenError){
    res.status(401).send({message: "Invalid refresh token"});
    return;
  }

  if (error instanceof InvalidCredentialsError) {
    res.status(401).send({ message: "Invalid credentials" });
    return;
  }

  if (error instanceof TokenExpiredError) {
    res.status(401).json({ message: "Token expired" });
    return;
  }

  if (error instanceof NotFoundError) {
    res.status(404).json({ message: error.message });
    return;
  }

  if (error instanceof UnauthorizedError) {
    res.status(403).json({ message: error.message });
    return;
  }

  res.status(500).send({ message: "Internal server error" });
}
