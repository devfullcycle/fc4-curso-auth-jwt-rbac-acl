import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import session from "express-session";
import { ClientTokenBasedHttp } from "../lib/ClientTokenBasedHttp";
import { logRequest, logResponse } from "../lib/log";

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//usando sessão
app.use(
  session({
    name: "auth-session",
    secret: process.env.SESSION_SECRET || "defaultSecret",
    resave: false,
    //saveUninitialized - salva a sessão mesmo que ela não tenha sido modificada
    saveUninitialized: false,
    //rolling - atualiza o cookie a cada requisição
    rolling: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      //7 days
      maxAge: 1000 * 60 * 60 * 24 * 7,
      //strict - só envia o cookie se a requisição for no mesmo domínio
      sameSite: "strict",
    },
  })
);

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

  if (!req.session.access_token || !req.session.refresh_token) {
    return res.redirect("/logout");
  }

  const token = req.session.access_token;
  try {
    const payload = jwt.verify(token, process.env.JWT_PUBLIC_KEY as string, {
      algorithms: ["RS256"],
    });
    req.user = payload;
    next();
  } catch (error) {
    console.error(error);
    if (error instanceof jwt.TokenExpiredError) {
      const authClient = new ClientTokenBasedHttp({
        baseURL: "http://localhost:3000",
        accessToken: req.session.access_token,
        refreshToken: req.session.refresh_token,
      });
      await authClient.doRefreshToken();
      req.session.access_token = authClient.accessToken!;
      req.session.refresh_token = authClient.refreshToken!;
      const payload = jwt.decode(authClient.accessToken!);
      req.user = payload;
      req.session.save((error) => {
        if (error) {
          console.error(error);
          res.redirect("/logout");
          return;
        }
        next();
      });
      return;
    }
    res.redirect("/logout");
  }
});

app.get("/login", async (req, res) => {
  res.send(`
    <h1>Login Session Cookie</h1>
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
  //const payload = jwt.decode()
  //req.session.user = payload;
  req.session.access_token = data.access_token;
  req.session.refresh_token = data.refresh_token;
  req.session.save((error) => {
    if (error) {
      console.error(error);
      return;
    }
    res.redirect("/protected");
  });
});

app.get("/protected", async (req, res) => {
  const http = new ClientTokenBasedHttp({
    baseURL: "http://localhost:3000",
    accessToken: req.session.access_token,
    refreshToken: req.session.refresh_token,
  });
  const data = await http.get("/protected", {}, true);
  console.log(data);
  res.send({ message: req.user.name });
});

app.get("/logout", async (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error(error);
      return;
    }
    res.redirect("/login");
  });
  res.clearCookie("auth-session");
});

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
