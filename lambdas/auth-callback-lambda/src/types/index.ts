export interface CognitoCallbackParams {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
}

export interface CognitoTokenResponse {
  access_token: string;
  id_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface UserInfo {
  sub: string;
  email: string;
  name?: string;
  email_verified: boolean;
}

export interface AuthErrorResponse {
  error: string;
  error_description?: string;
  message?: string;
}

export interface AuthSuccessResponse {
  success: boolean;
  user: UserInfo;
  access_token: string;
  id_token: string;
  expires_in: number;
}