import type { Session } from "express-session";

declare module "express-session" {
  interface Session {
    access_token: string;
    refresh_token: string;
  }
}