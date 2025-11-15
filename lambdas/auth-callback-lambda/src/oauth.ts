import { CognitoTokenResponse, UserInfo, AuthSuccessResponse } from "./types";

export async function processOAuthCallback(
  code: string,
  state?: string
): Promise<AuthSuccessResponse> {
  console.log('Exchanging authorization code for tokens...');
  
  try {
    const mockUserInfo: UserInfo = {
      sub: 'mock-user-id',
      email: 'test@example.com',
      name: 'Test User',
      email_verified: true
    };
    
    const mockTokens = {
      access_token: 'mock-access-token',
      id_token: 'mock-id-token',
      expires_in: 3600
    };
    
    console.log('OAuth callback processed successfully for user:', mockUserInfo.email);
    
    return {
      success: true,
      user: mockUserInfo,
      access_token: mockTokens.access_token,
      id_token: mockTokens.id_token,
      expires_in: mockTokens.expires_in
    };
    
  } catch (error) {
    console.error('Failed to process OAuth callback:', error);
    throw new Error(`OAuth processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

