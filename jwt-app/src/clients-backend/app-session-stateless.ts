import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ClientTokenBasedHttp } from "../lib/ClientTokenBasedHttp";
import { getIronSession } from "iron-session";
import { logRequest, logResponse } from "../lib/log";

type Tokens = {
  access_token: string;
  refresh_token: string;
};

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
  const session = await getIronSession<Tokens>(req, res, {
    cookieName: "auth-session",
    password: "01234567890123456789012345678912345",
    ttl: 60 * 60 * 24 * 7, // 1 week
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7 - 60, // Expire cookie before the session expires.
      path: "/",
    },
  });
  req.statelessSession = session;
  return next();
});

//log requests
app.use(logRequest);
//log responses headers
app.use(logResponse);

const protectedRoutes = ["/protected"];

app.use(async (req, res, next) => {
  const isProtectedRoute = protectedRoutes.some((route) =>
    req.url.startsWith(route)
  );

  if (!isProtectedRoute) {
    return next();
  }

  if (!req.statelessSession.access_token || !req.statelessSession.refresh_token) {
    return res.redirect("/logout");
  }

  const token = req.statelessSession.access_token;
  try {
    const payload = jwt.verify(token, process.env.JWT_PUBLIC_KEY as string, {
      algorithms: ["RS256"],
    }) as { sub: string; name: string; email: string };
    req.user = payload;
    next();
  } catch (error) {
    console.error(error);
    if (error instanceof jwt.TokenExpiredError) {
      const authClient = new ClientTokenBasedHttp({
        baseURL: "http://localhost:3000",
        accessToken: token,
        refreshToken: req.statelessSession.refresh_token,
      });
      await authClient.doRefreshToken();
      req.statelessSession.access_token = authClient.accessToken!;
      req.statelessSession.refresh_token = authClient.refreshToken!;
      const payload = jwt.decode(authClient.accessToken!);
      req.user = payload;
      await req.statelessSession.save();

      return next();
    }
    res.redirect("/logout");
  }
});

app.get("/login", async (req, res) => {
  res.send(`
    <h1>Login Session Stateless</h1>
    <form action="/login" method="post">
      <input type="email" name="email" value="admin@user.com"  />
      <input type="password" name="password" value="admin" />
      <button type="submit">Login</button>
    </form>
  `);
});

app.post("/login", async (req, res) => {
  const http = new ClientTokenBasedHttp({ baseURL: "http://localhost:3000" });
  const data = await http.post(
    "/login",
    { email: req.body.email, password: req.body.password },
    {},
    false
  );
  req.statelessSession.access_token = data.access_token;
  req.statelessSession.refresh_token = data.refresh_token;
  await req.statelessSession.save();
  res.redirect("/protected"); // redirect to protected route
});

app.get("/protected", async (req, res) => {
  const http = new ClientTokenBasedHttp({
    baseURL: "http://localhost:3000",
    accessToken: req.statelessSession.access_token,
    refreshToken: req.statelessSession.refresh_token,
  });
  const data = await http.get("/protected", {}, true);
  console.log(data);
  res.send({ message: req.user.name });
});

app.get("/logout", async (req, res) => {
  req.statelessSession.destroy(); //remoção do cookie
  res.redirect("/login");
});

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
