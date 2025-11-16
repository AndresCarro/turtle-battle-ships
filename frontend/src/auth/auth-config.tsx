import { createContext, useState, type ReactNode } from "react";
import type { CognitoTokens } from "./cognito";

export interface AuthState {
  accessToken: string | null;
  idToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null; // epoch seconds
}

interface AuthContextType {
  auth: AuthState;
  setTokens: (t: CognitoTokens) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem("auth");
    return saved
      ? JSON.parse(saved)
      : {
          accessToken: null,
          idToken: null,
          refreshToken: null,
          expiresAt: null,
        };
  });

  const setTokens = (tokens: CognitoTokens) => {
    const newState: AuthState = {
      accessToken: tokens.access_token,
      idToken: tokens.id_token,
      refreshToken: tokens.refresh_token ?? auth.refreshToken,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    };

    setAuth(newState);
    localStorage.setItem("auth", JSON.stringify(newState));
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setAuth({
      accessToken: null,
      idToken: null,
      refreshToken: null,
      expiresAt: null,
    });

    const domain = import.meta.env.VITE_COGNITO_DOMAIN;
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const redirect = import.meta.env.VITE_LOGOUT_REDIRECT_URI;

    window.location.href =
      `${domain}/logout?client_id=${clientId}&logout_uri=${redirect}`;
  };

  return (
    <AuthContext.Provider value={{ auth, setTokens, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
