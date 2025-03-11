import express, { NextFunction } from "express";
import { loadFixtures } from "./fixtures";
import { logRequest, logResponse } from "../lib/log";
import { userRouter } from "./router/user-router";
import {
  AuthenticationService,
} from "./services/AuthenticationService";
import dotenv from "dotenv";
import {
  InvalidAccessTokenError,
  InvalidCredentialsError,
  NotFoundError,
  TokenExpiredError,
  TokenNotProvidedError,
} from "./errors";
import jwt from "jsonwebtoken";
import { createUserService } from "./services/UserService";
import { createCartService } from "./services/CartService";
import cors from 'cors';
import { authRouter } from "./router/auth-router";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
//log requests
app.use(logRequest);
//log responses headers
app.use(logResponse);

const protectedRoutes = ["/protected", "/users"];

app.use(async (req, res, next) => {
  const isProtectedRoute = protectedRoutes.some((route) =>
    req.url.startsWith(route)
  );

  if (!isProtectedRoute) {
    return next();
  }

  const accessToken = req.headers.authorization?.replace("Bearer ", "");

  if (!accessToken) {
    next(new TokenNotProvidedError());
    return;
  }

  try {
    const payload = AuthenticationService.verifyAccessToken(accessToken);
    const userService = await createUserService();
    const user = await userService.findById(+payload.sub);
    req.user = user!; 
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



app.get("/protected", (req, res) => {
  res.status(200).json(req.user)
});

// Rotas da API
app.use("", authRouter);
app.use("", userRouter);

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

  res.status(500).send({ message: "Internal server error" });
}
