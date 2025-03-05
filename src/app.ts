import express, { NextFunction } from "express";
import { loadFixtures } from "./fixtures";
import { logRequest, logResponse } from "./lib/log";
import { userRouter } from "./router/user-router";
import { createDatabaseConnection } from "./database";
import jwt from "jsonwebtoken";

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
    throw new Error("Access Token not provided");
  }

  try {
    const payload = jwt.verify(accessToken, "secret");
    console.log(payload);
  } catch (e) {
    res.status(401).json({message: 'Invalid Access Token'})
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

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const { userRepository } = await createDatabaseConnection();
  const user = await userRepository.findOne({ where: { email } });
  if (!user || !user.comparePassword(password)) {
    throw new Error("Invalid Credentials");
  }
  const accessToken = jwt.sign(
    { name: user.name, email: user.email },
    "secret"
  );
  res.json({ access_token: accessToken });
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

  //some errors

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
  res.status(500).send({ message: "Internal server error" });
}
