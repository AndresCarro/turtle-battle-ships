export interface CognitoTokens {
  access_token: string;
  id_token: string;
  refresh_token?: string; // viene solo la primera vez
  expires_in: number;
  token_type: "Bearer";
}
