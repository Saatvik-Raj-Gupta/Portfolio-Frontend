# Deployment Checklist

Before deploying your portfolio website, follow this checklist:

## 1. Environment Variables Setup

### Local Testing
- [x] `.env.development` is configured with local backend URL
- [ ] Test all API endpoints locally with `npm run dev`

### Production Setup
- [ ] Update `.env.production` with your production backend URL
  ```bash
  VITE_API_BASE_URL=https://your-backend-domain.com/api
  ```
- [ ] Verify the backend URL is correct and accessible
- [ ] Test backend API endpoints are working

## 2. Code Review

- [ ] All console.logs removed or conditional (dev-only)
- [ ] No hardcoded URLs or sensitive data
- [ ] All TypeScript errors resolved: `npm run build`
- [ ] Linting passes: `npm run lint`

## 3. Build & Test

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview
```

- [ ] Production build completes successfully
- [ ] Preview build works correctly
- [ ] All commands work in preview mode
- [ ] Links are clickable
- [ ] Mobile view is responsive
- [ ] Typing sound works
- [ ] API calls succeed

## 4. Deployment Platform Setup

### Option A: Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add environment variables in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add `VITE_API_BASE_URL` with your production backend URL
   - Redeploy

### Option B: Netlify

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy --prod
   ```

3. Add environment variables in Netlify Dashboard:
   - Go to Site Settings → Environment Variables
   - Add `VITE_API_BASE_URL`
   - Trigger a new deploy

### Option C: GitHub Pages

1. Update `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/repository-name/',
     // ... rest of config
   });
   ```

2. Add to `package.json`:
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

3. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

## 5. Backend Configuration

- [ ] Backend CORS is configured to allow your frontend domain
- [ ] Backend API is deployed and accessible
- [ ] Backend health check endpoint works
- [ ] All API endpoints return correct data

## 6. DNS & Domain (If using custom domain)

- [ ] Domain purchased
- [ ] DNS records configured:
  - A record or CNAME pointing to hosting provider
  - WWW subdomain configured (optional)
- [ ] SSL certificate is active (usually automatic with hosting providers)

## 7. Post-Deployment Testing

- [ ] Visit production URL
- [ ] Test all commands (help, about, projects, skills, etc.)
- [ ] Click all links - verify they work
- [ ] Test on mobile device
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Check browser console for errors
- [ ] Verify API calls succeed (Network tab)

## 8. Monitoring & Analytics (Optional)

- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure analytics (e.g., Google Analytics)
- [ ] Set up uptime monitoring (e.g., UptimeRobot)

## Quick Deploy Commands

```bash
# Build and check for errors
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod
```

## Common Issues

### Issue: API calls fail in production
- **Solution**: Check CORS settings in backend
- **Solution**: Verify `VITE_API_BASE_URL` is set correctly

### Issue: 404 errors on page refresh
- **Solution**: Configure hosting to redirect all routes to index.html
- **Vercel**: Add `vercel.json` with rewrites
- **Netlify**: Add `_redirects` file

### Issue: Environment variables not working
- **Solution**: Ensure variables are prefixed with `VITE_`
- **Solution**: Rebuild after changing environment variables
- **Solution**: Check hosting platform environment variables are set

## Useful Files Created

- `.env.example` - Template for environment variables
- `.env.development` - Development environment config
- `.env.production` - Production environment config
- `src/config/index.ts` - Centralized configuration management
- `ENV_SETUP.md` - Detailed environment setup guide
