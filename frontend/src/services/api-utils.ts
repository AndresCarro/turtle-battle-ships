import { AuthService } from "./auth-service";

export const API_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const WEBSOCKET_URL =
  import.meta.env.VITE_WEBSOCKETS_URL || "http://localhost:3000";

export const S3_GAME_REPLAY_BUCKET_URL =
  import.meta.env.VITE_S3_GAME_REPLAY_BUCKET_URL ||
  "https://your-s3-bucket-url";

export async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || "API Error");
  }
  return res.json();
}

interface ApiFetchOptions extends RequestInit {
  retry?: boolean;
}

export async function apiFetch(
  url: string,
  options: ApiFetchOptions = {},
  auth: {
    accessToken: string | null;
    idToken?: string | null;
    setTokens: (t: any) => void;
    logout: () => void;
  }
): Promise<Response> {
  const { accessToken, setTokens, logout } = auth;

  let res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: accessToken ? `Bearer ${accessToken}` : "",
    },
  });

  if (res.status !== 401 || options.retry) {
    return res;
  }

  const newTokens = await AuthService.refreshTokens();

  if (!newTokens) {
    logout();
    return res;
  }

  setTokens(newTokens);

  return apiFetch(
    url,
    { ...options, retry: true },
    {
      ...auth,
      accessToken: newTokens.access_token,
    }
  );
}
