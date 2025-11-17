import { Issuer } from 'openid-client';
import { UserInfo, AuthSuccessResponse } from "./types";
import { decode } from 'jsonwebtoken';

export async function processOAuthCallback(
  code: string,
  state?: string,
  redirectUri?: string
): Promise<AuthSuccessResponse> {
  console.log('Processing OAuth callback using openid-client...');

  const domain = process.env.COGNITO_DOMAIN;
  const clientId = process.env.COGNITO_CLIENT_ID;
  const clientSecret = process.env.COGNITO_CLIENT_SECRET;

  console.log('Using COGNITO_DOMAIN:', domain);
  console.log('Using COGNITO_CLIENT_ID:', clientId);
  console.log('Using redirectUri parameter:', redirectUri);

  if (!domain || !clientId || !redirectUri) {
    throw new Error('Missing required environment variables: COGNITO_DOMAIN, COGNITO_CLIENT_ID, or redirectUri parameter');
  }

  try {
    const issuerUrl = `https://${domain}`;
    console.log('Discovering issuer at', issuerUrl);
    const issuer = await Issuer.discover(issuerUrl);

    const client = new issuer.Client({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uris: [redirectUri],
        response_types: ['code']
    })

    const params: any = { code }; 
    if (state) params.state = state;

    const checks: any = {};
    if (state) checks.state = state;

    const tokenSet = await client.callback(redirectUri as string, params, checks);

    const access_token = tokenSet.access_token as string;
    const id_token = tokenSet.id_token as string | undefined;
    const expires_in = (tokenSet.expires_in as number) || 0;

    if (!access_token) {
      throw new Error('Token exchange did not return an access_token');
    }

    let username: string | undefined = undefined;
    if (id_token) {
      try {
        const decoded = decode(id_token) as any;
        if (decoded && typeof decoded === 'object') {
          username = decoded['cognito:username'];
          console.log('Decoded username from id_token using jsonwebtoken:', username);
        }
      } catch (e) {
        console.warn('Failed to decode id_token using jsonwebtoken', e);
      }
    }

    const userInfo = await client.userinfo(access_token);

    const user: UserInfo = {
      sub: (userInfo as any).sub,
      email: (userInfo as any).email,
      username: username || "",
    };

    console.log('Successfully exchanged code and fetched user info for', user.email || user.sub);

    return {
      success: true,
      user,
      access_token,
      id_token: id_token || '',
      expires_in
    };
  } catch (err) {
    console.error('openid-client processing failed', err);
    throw new Error(`OAuth processing failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

