import Cookies from "js-cookie";

// The Laravel backend issues a Sanctum personal-access-token as a plain
// string (AuthController::login/register return { token }) — there's no
// httpOnly cookie or refresh flow on the backend, so the token is stored
// in a regular (non-httpOnly) cookie rather than localStorage, which lets
// middleware.ts read it on the server to guard routes before any client
// JS runs. This is a pragmatic match to what the backend actually issues,
// not a claim that it's maximally secure — revisit if the backend adds
// httpOnly cookie-based Sanctum SPA auth later.
const TOKEN_COOKIE = "routeflow_token";

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_COOKIE);
}

export function setToken(token: string): void {
  Cookies.set(TOKEN_COOKIE, token, {
    expires: 30,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function clearToken(): void {
  Cookies.remove(TOKEN_COOKIE);
}

export const TOKEN_COOKIE_NAME = TOKEN_COOKIE;
