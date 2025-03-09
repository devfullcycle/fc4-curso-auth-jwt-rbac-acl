import { test, beforeEach, mock } from "node:test";
import assert from "node:assert";
import { ClientTokenBasedHttp } from "./ClientTokenBasedHttp";
import jwt from "jsonwebtoken";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

beforeEach(() => {
  // Reset the global fetch mock before each test
  //@ts-ignore - mock.method is valid
  mock.method(global, "fetch", async (url: string, config: RequestInit) => {
    if (url.endsWith("/login")) {
      const access_token = jwt.sign({ foo: "bar" }, "secret", { expiresIn: "1s" });
      const refresh_token = jwt.sign({ foo: "bar" }, "secret", { expiresIn: "7d" });
      return new Response(JSON.stringify({ access_token, refresh_token }));
    }
    return new Response(JSON.stringify({ data: "success" }));
  });
});

test("should check token expiration before making request", async () => {
  let refreshCalled = false;
  const client = new ClientTokenBasedHttp({ baseURL: "http://localhost:3000" });
  
  await client.login("test@test.com", "password");
  await sleep(1100); // Wait for token to expire

  //@ts-ignore - mock.method is valid
  mock.method(global, "fetch", async (url: string, config: RequestInit) => {
    if (url.endsWith("/refresh-token")) {
      refreshCalled = true;
      const access_token = jwt.sign({ foo: "bar" }, "secret", { expiresIn: "1s" });
      const refresh_token = jwt.sign({ foo: "bar" }, "secret", { expiresIn: "7d" });
      return new Response(JSON.stringify({ access_token, refresh_token }));
    }
    return new Response(JSON.stringify({ data: "success" }));
  });

  await client.get("/test");
  assert.equal(refreshCalled, true, "Should have called refresh token endpoint");
  assert.ok(client.refreshToken, "Should have stored refresh token");
});

test("should attempt refresh token on 401 response", async () => {
  const client = new ClientTokenBasedHttp({ baseURL: "http://localhost:3000" });
  let refreshAttempted = false;
  let requestAttempts = 0;

  await client.login("test@test.com", "password");
  assert.ok(client.refreshToken, "Should have received refresh token on login");

  //@ts-ignore - mock.method is valid
  mock.method(global, "fetch", async (url: string, config: RequestInit) => {
    if (url.endsWith("/test")) {
      requestAttempts++;
      // First attempt returns 401
      if (requestAttempts === 1) {
        return new Response(null, { status: 401 });
      }
      // Second attempt after refresh should succeed
      return new Response(JSON.stringify({ data: "success" }));
    }
    
    if (url.endsWith("/refresh-token")) {
      refreshAttempted = true;
      const headers = config.headers as Record<string, string>;

      assert.ok(headers?.['Authorization']?.includes(client.refreshToken!), 
        "Should send refresh token in Authorization header");
      
      const access_token = jwt.sign({ foo: "bar" }, "secret", { expiresIn: "1s" });
      const refresh_token = jwt.sign({ foo: "bar" }, "secret", { expiresIn: "7d" });
      return new Response(JSON.stringify({ access_token, refresh_token }));
    }
  });

  await client.get("/test");
  assert.equal(refreshAttempted, true, "Should have attempted token refresh");
  assert.equal(requestAttempts, 2, "Should have attempted the request twice");
});

test("should clear tokens when refresh token fails", async () => {
  const client = new ClientTokenBasedHttp({ baseURL: "http://localhost:3000" });
  
  await client.login("test@test.com", "password");
  assert.ok(client.accessToken, "Should have access token");
  assert.ok(client.refreshToken, "Should have refresh token");

  //@ts-ignore - mock.method is valid
  mock.method(global, "fetch", async (url: string) => {
    if (url.endsWith("/refresh-token")) {
      return new Response(null, { status: 401 });
    }
    return new Response(null, { status: 401 });
  });

  try {
    await client.get("/test");
    assert.fail("Should throw error");
  } catch (error) {
    assert.equal(client.accessToken, null, "Should clear access token");
    assert.equal(client.refreshToken, null, "Should clear refresh token");
  }
});