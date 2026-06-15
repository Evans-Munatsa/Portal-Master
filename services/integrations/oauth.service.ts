/**
 * Note: For profound OAuth integrations in Next.js, 
 * libraries like \`next-auth\` (Auth.js) are often used to handle the lifecycle.
 * However, we can construct the manual Google Web OAuth flow redirect URLs and validations here.
 */

export class OAuthService {
  /**
   * Generates the Google OAuth consent screen URL.
   */
  static getGoogleAuthUrl() {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URL || 'http://localhost:3000/api/auth/google/callback',
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ].join(' ')
    };

    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  /**
   * Exchanges the OAuth Code for Access/Refresh Tokens.
   */
  static async getGoogleOAuthTokens(code: string) {
    const url = 'https://oauth2.googleapis.com/token';
    const values = {
      code,
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
      redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URL || 'http://localhost:3000/api/auth/google/callback',
      grant_type: 'authorization_code',
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(values).toString()
      });
      return await res.json();
    } catch (err: any) {
      console.error(err);
      throw new Error(err.message);
    }
  }
}
