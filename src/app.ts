import express, { NextFunction } from "express";
import { loadFixtures } from "./fixtures";
import { logRequest, logResponse } from "./lib/log";
import { userRouter } from "./router/user-router";
import {
  AuthenticationService,
  createAuthenticationService,
} from "./services/AuthenticationService";
import dotenv from "dotenv";
import {
  InvalidAccessTokenError,
  InvalidCredentialsError,
  TokenNotProvidedError,
} from "./errors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

//log requests
app.use(logRequest);
//log responses headers
app.use(logResponse);

const protectedRoutes = ["/protected", "/users"];

app.use((req, res, next) => {
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
    console.log(payload);
    next();
  } catch (e) {
    next(new InvalidAccessTokenError({ options: { cause: e } }));
    return;
  }
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

app.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const authService = await createAuthenticationService();
    const accessToken = await authService.login(email, password);
    res.json({ access_token: accessToken });
  } catch (e) {
    next(e);
  }
});

// Rotas da API
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

  res.status(500).send({ message: "Internal server error" });
}
