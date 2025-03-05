import { Request, Response, NextFunction } from "express";


export function logRequest(req: Request, res: Response, next: NextFunction) {
  console.log(
    `request - [${new Date().toISOString().split('.')[0]}] ${req.method} ${req.url}`
  );
  next();
}

export function logResponse(req: Request, res: Response, next: NextFunction) {
  res.on("finish", () => {
    console.log(
      `response - [${new Date().toISOString().split('.')[0]}] ${req.method} ${req.url} ${
        res.statusCode
      } ${res.statusMessage}`
    );
  });

  next();
}