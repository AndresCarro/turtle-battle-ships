import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { CognitoCallbackParams, AuthErrorResponse } from "./types";
import { processOAuthCallback } from "./oauth";

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log('Processing OAuth callback:', JSON.stringify(event, null, 2));
  
  try {
    const queryParams: CognitoCallbackParams = event.queryStringParameters || {};
    const { code, state, error, error_description } = queryParams;
    
    if (error) {
      console.error('OAuth error received:', { error, error_description });
      
      const frontendUrl = process.env.FRONTEND_URL || 'https://turtle-battleships-frontend-sample.s3-website-us-east-1.amazonaws.com';
      const errorUrl = `${frontendUrl}/?auth_error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(error_description || '')}`;
      
      return {
        statusCode: 302,
        headers: {
          Location: errorUrl,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: ''
      };
    }
    
    if (!code) {
      console.error('No authorization code received in callback');
      
      const errorResponse: AuthErrorResponse = {
        error: 'invalid_request',
        error_description: 'No authorization code was provided in the callback',
        message: 'Missing authorization code'
      };
      
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(errorResponse)
      };
    }
    
    console.log('Processing authorization code:', { code: code.substring(0, 10) + '...', state });
    
    const result = await processOAuthCallback(code, state);
    const frontendUrl = process.env.FRONTEND_URL || 'https://turtle-battleships-frontend-sample.s3-website-us-east-1.amazonaws.com';
    const successUrl = `${frontendUrl}/?auth_success=true&user=${encodeURIComponent(JSON.stringify(result.user))}&access_token=${encodeURIComponent(result.access_token)}&id_token=${encodeURIComponent(result.id_token)}&expires_in=${result.expires_in}${state ? `&state=${encodeURIComponent(state)}` : ''}`;
    
    console.log('Redirecting to frontend with auth success');
    
    return {
      statusCode: 302,
      headers: {
        Location: successUrl,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: ''
    };
    
  } catch (error) {
    console.error('Error processing OAuth callback:', error);
    
    const errorResponse: AuthErrorResponse = {
      error: 'server_error',
      error_description: 'Failed to process authentication callback',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(errorResponse)
    };
  }
};