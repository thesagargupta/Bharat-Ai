# Environment Variables Quick Reference

## Required Environment Variables

Copy these into your `.env.local` file in the project root:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# Google OAuth Credentials
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# GitHub OAuth Credentials
GITHUB_ID=
GITHUB_SECRET=
```

## How to Get Each Value

### NEXTAUTH_SECRET
Generate using one of these commands:

**Mac/Linux/WSL:**
```bash
openssl rand -base64 32
```

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET
1. Visit: https://console.cloud.google.com/
2. Create a new project or select existing
3. Go to: APIs & Services > Credentials
4. Create OAuth 2.0 Client ID
5. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret

### GITHUB_ID & GITHUB_SECRET
1. Visit: https://github.com/settings/developers
2. Click: OAuth Apps > New OAuth App
3. Set callback URL: `http://localhost:3000/api/auth/callback/github`
4. Register application
5. Generate client secret
6. Copy Client ID and Client Secret

## Example .env.local File

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=abc123xyz789SecretKeyHere==

# Google OAuth Credentials
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcd1234efgh5678ijkl

# GitHub OAuth Credentials
GITHUB_ID=Iv1.a1b2c3d4e5f6g7h8
GITHUB_SECRET=abc123def456ghi789jkl012mno345pqr678stu
```

## Important Notes

⚠️ **Never commit your .env.local file to version control!**

✅ The file is already in .gitignore
✅ Always keep your secrets secure
✅ Use different credentials for development and production
✅ Restart your development server after changing environment variables

## Verification

After adding all variables, verify with:

```bash
npm run dev
```

You should see no errors about missing environment variables.

## Troubleshooting

**Issue**: "Missing NEXTAUTH_SECRET"
**Solution**: Make sure the variable is set and restart the dev server

**Issue**: "Invalid redirect URI"
**Solution**: Verify the callback URLs match exactly in your OAuth app settings

**Issue**: Variables not loading
**Solution**: 
1. Make sure file is named exactly `.env.local`
2. File must be in the project root (same level as package.json)
3. Restart the development server
