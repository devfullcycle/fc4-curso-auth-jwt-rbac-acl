import express, { NextFunction } from "express";
import { loadFixtures } from "./fixtures";
import { logRequest, logResponse } from "./lib/log";
import { userRouter } from "./router/user-router";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

//log requests
app.use(logRequest);
//log responses headers
app.use(logResponse);


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
  if(!error){
    return;
  }
  
  //some errors

  const errorDetails = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    cause: error.cause,
  };
  console.error("Error details:", JSON.stringify(errorDetails, (key, value) => {
    // Se for a stack trace, formata com quebras de linha adequadas
    if (key === 'stack' && typeof value === 'string') {
      return value.split('\n').map(line => line.trim());
    }
    return value;
  }, 2));
  res.status(500).send({ message: "Internal server error" });
}
