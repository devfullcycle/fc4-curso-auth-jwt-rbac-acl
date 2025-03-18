import type * as express from "express";
import type { User } from "../../auth-server/entities/User";
import type { IronSession } from "iron-session";

declare global {
  namespace Express {
    interface Request {
      statelessSession: IronSession<{ access_token: string; refresh_token: string }>;
      user: User;
    }
  }
}
