# Environment Variables Setup Guide

This project uses environment variables to manage configuration across different environments (development, production, etc.).

## Files Structure

- `.env.example` - Template file showing all available environment variables (committed to git)
- `.env.development` - Development environment variables (committed to git for local setup)
- `.env.production` - Production environment variables (should be updated before deployment)
- `.env.local` - Local overrides (git-ignored, optional)

## Available Environment Variables

### Required Variables

- `VITE_API_BASE_URL` - The backend API base URL
  - Development: `http://localhost:8080/api`
  - Production: Your deployed backend URL (e.g., `https://api.yourdomain.com/api`)

## Setup Instructions

### For Local Development

1. Copy `.env.example` to `.env.local` if you need custom local settings:
   ```bash
   cp .env.example .env.local
   ```

2. The project will automatically use `.env.development` for local development

3. Start the dev server:
   ```bash
   npm run dev
   ```

### For Production Deployment

1. Update `.env.production` with your production backend URL:
   ```bash
   VITE_API_BASE_URL=https://your-actual-backend-url.com/api
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. The build will use variables from `.env.production`

## Platform-Specific Setup

### Vercel / Netlify / Other Hosting

Add environment variables in your hosting platform's dashboard:
- Variable Name: `VITE_API_BASE_URL`
- Value: Your production backend URL

### Important Notes

- All environment variables must be prefixed with `VITE_` to be accessible in the frontend
- Never commit `.env.local` or any file containing sensitive data
- Update `.env.production` before deployment
- Environment variables are embedded at build time (not runtime)

## Accessing Environment Variables in Code

```typescript
// In any .ts or .tsx file:
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

## Security

- The `.env.local` and sensitive files are git-ignored
- Only `.env.example`, `.env.development`, and `.env.production` (template) are tracked
- Update production values directly in your hosting platform or before deployment
