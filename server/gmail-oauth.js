const { google } = require('googleapis');
const http = require('http');
const { URL } = require('url');
const dotenv = require('dotenv');
dotenv.config();

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const scopes = ['https://www.googleapis.com/auth/gmail.send'];

if (process.argv[2] === 'url') {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes
  });
  console.log('\n==================== AUTHORIZE URL ====================');
  console.log(url);
  console.log('========================================================\n');
  console.log('1. Open the URL above in your browser');
  console.log('2. Log in with fithub601@gmail.com and click "Allow"');
  console.log('3. You will be redirected to http://localhost/?code=...');
  console.log('4. Copy the ENTIRE redirected URL (or just the code) and:\n');
  console.log('   node gmail-oauth.js "http://localhost/?code=YOUR_CODE&scope=..."\n');
} else {
  const redirectUrl = process.argv[2];
  if (!redirectUrl) {
    console.error('Usage: node gmail-oauth.js <redirected-URL-or-code>');
    process.exit(1);
  }
  const codeMatch = redirectUrl.match(/code=([^&]+)/);
  if (!codeMatch) {
    console.error('Could not find code= in the provided URL.');
    process.exit(1);
  }
  const code = decodeURIComponent(codeMatch[1]);
  (async () => {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      console.log('\n==================== TOKENS ====================');
      console.log('Refresh Token:', tokens.refresh_token);
      console.log('Access Token:', tokens.access_token);
      console.log('================================================\n');
      if (tokens.refresh_token) {
        console.log('Save these in server/.env:');
        console.log(`GMAIL_CLIENT_ID=${CLIENT_ID}`);
        console.log(`GMAIL_CLIENT_SECRET=${CLIENT_SECRET}`);
        console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
      } else {
        console.error('NO REFRESH TOKEN RETURNED. Try again ensuring the URL shows prompt=consent.');
      }
    } catch (e) {
      console.error('Token exchange error:', e.message);
    }
  })();
}