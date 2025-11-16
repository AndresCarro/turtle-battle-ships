import { useAuth } from "@/auth/auth";
import { AuthService } from "@/services/auth-service";
import { useEffect } from "react";

export default function Callback() {
  const { setTokens } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) return;

    AuthService.exchangeCodeForTokens(code)
      .then((tokens) => {
        setTokens(tokens);
        window.location.href = "/";
      })
      .catch(() => alert("Error procesando login"));
  }, [setTokens]);

  return <div>Procesando login…</div>;
}
