import type { CognitoTokens } from "@/auth/cognito";


const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN;
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_COGNITO_REDIRECT_URI;
const SCOPES = import.meta.env.VITE_COGNITO_SCOPES ?? "openid email profile";

export const AuthService = {
  login(): void {
    const url = new URL(`${COGNITO_DOMAIN}/oauth2/authorize`);
    url.searchParams.set("client_id", CLIENT_ID);
    url.searchParams.set("redirect_uri", REDIRECT_URI);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", SCOPES);

    window.location.href = url.toString();
  },

  async exchangeCodeForTokens(code: string): Promise<CognitoTokens> {
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("client_id", CLIENT_ID);
    params.append("code", code);
    params.append("redirect_uri", REDIRECT_URI);

    const res = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    if (!res.ok) {
      console.error(await res.text());
      throw new Error("Failed to exchange code for tokens");
    }

    return res.json();
  },

  async refreshTokens(): Promise<CognitoTokens | null> {
    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("client_id", CLIENT_ID);

    const res = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      credentials: "include", // 🚀 REQUIRED para enviar cookie de refresh
      body: params,
    });

    if (!res.ok) {
      console.warn("Refresh token failed, user must re-login");
      return null;
    }

    return res.json();
  },
};

