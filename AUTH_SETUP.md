# Authentication Setup Guide

This guide will help you set up Google and GitHub OAuth authentication for Bharat AI.

## Prerequisites

- Node.js installed
- A Google Cloud account
- A GitHub account

## Step 1: Generate NextAuth Secret

First, generate a secure secret for NextAuth:

```bash
# Using OpenSSL (Mac/Linux/WSL)
openssl rand -base64 32

# Using PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Copy this value and add it to your `.env.local` file as `NEXTAUTH_SECRET`.

## Step 2: Set Up Google OAuth

### 2.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown and create a new project
3. Name it "Bharat AI" (or any name you prefer)

### 2.2 Configure OAuth Consent Screen

1. Navigate to **APIs & Services** > **OAuth consent screen**
2. Select **External** user type
3. Fill in the required information:
   - App name: **Bharat AI**
   - User support email: Your email
   - Developer contact: Your email
4. Click **Save and Continue**
5. Skip the Scopes section (click **Save and Continue**)
6. Add test users (your email) if needed
7. Click **Save and Continue**

### 2.3 Create OAuth Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application**
4. Name it "Bharat AI Web Client"
5. Add Authorized JavaScript origins:
   - `http://localhost:3000`
6. Add Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
7. Click **Create**
8. Copy the **Client ID** and **Client Secret**
9. Add them to your `.env.local` file:
   ```
   GOOGLE_CLIENT_ID=your-client-id-here
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   ```

## Step 3: Set Up GitHub OAuth

### 3.1 Create GitHub OAuth App

1. Go to [GitHub Settings > Developer Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** > **New OAuth App**
3. Fill in the form:
   - Application name: **Bharat AI**
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Click **Register application**

### 3.2 Generate Client Secret

1. On your OAuth app page, click **Generate a new client secret**
2. Copy the **Client ID** and **Client Secret**
3. Add them to your `.env.local` file:
   ```
   GITHUB_ID=your-github-client-id-here
   GITHUB_SECRET=your-github-client-secret-here
   ```

## Step 4: Complete .env.local File

Your final `.env.local` file should look like this:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# GitHub OAuth Credentials
GITHUB_ID=your-github-client-id-here
GITHUB_SECRET=your-github-client-secret-here
```

## Step 5: Run the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Step 6: Test Authentication

1. You should be redirected to the login page
2. Click "Continue with Google" or "Continue with GitHub"
3. Complete the OAuth flow
4. You should be redirected to the home page after successful authentication

## Production Deployment

When deploying to production (e.g., Vercel, Netlify):

1. Update `NEXTAUTH_URL` in your environment variables to your production URL
2. Update OAuth redirect URIs in Google and GitHub to use your production domain:
   - Google: `https://yourdomain.com/api/auth/callback/google`
   - GitHub: `https://yourdomain.com/api/auth/callback/github`
3. Add your production domain to authorized origins in Google Cloud Console

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Make sure the redirect URI in your OAuth app matches exactly: `http://localhost:3000/api/auth/callback/google` or `/github`
   - Check for trailing slashes

2. **"Error: Missing NEXTAUTH_SECRET"**
   - Make sure you've generated and added the secret to `.env.local`
   - Restart your development server after adding environment variables

3. **"Error: Missing client ID or secret"**
   - Double-check that all credentials are correctly copied to `.env.local`
   - Make sure there are no extra spaces or quotes

4. **Session not persisting**
   - Clear your browser cookies
   - Make sure `NEXTAUTH_URL` matches your development URL exactly

## Features Implemented

✅ Google OAuth authentication
✅ GitHub OAuth authentication
✅ Protected routes (home, chat, profile pages)
✅ Automatic redirect to login for unauthenticated users
✅ Automatic redirect to home after successful login
✅ Session management with NextAuth
✅ Sign out functionality
✅ User profile page with real user data
✅ Loading states during authentication check

## Security Notes

- Never commit your `.env.local` file to version control
- The `.env.local` file is already in `.gitignore`
- Rotate your secrets periodically
- Use different credentials for development and production
- Enable 2FA on your Google and GitHub accounts

## Support

If you encounter any issues, please check:
- NextAuth.js documentation: https://next-auth.js.org/
- Google OAuth documentation: https://developers.google.com/identity/protocols/oauth2
- GitHub OAuth documentation: https://docs.github.com/en/developers/apps/building-oauth-apps
