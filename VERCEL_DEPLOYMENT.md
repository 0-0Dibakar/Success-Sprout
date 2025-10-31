# Deploy Success Sprout to Vercel

This guide will help you deploy your Success Sprout application to Vercel.

## Prerequisites

- GitHub account
- Vercel account (free tier is fine)
- Supabase project (already set up)

## Step 1: Push to GitHub

If you haven't already:

```bash
git init
git add .
git commit -m "Initial commit - Success Sprout ready for deployment"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

Replace `YOUR_GITHUB_REPO_URL` with your actual GitHub repository URL.

## Step 2: Deploy to Vercel

1. **Go to Vercel:**
   - Visit https://vercel.com
   - Sign in with your GitHub account

2. **Import Project:**
   - Click "Add New Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project:**
   - Framework Preset: Leave as "Other" or select "Node.js"
   - Root Directory: `./`
   - Build Command: Leave empty
   - Output Directory: Leave empty
   - Install Command: `npm install`

4. **Add Environment Variables:**
   Click "Environment Variables" and add:

   ```
   SUPABASE_URL=https://nvmftyzumznwqdtlggkt.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52bWZ0eXp1bXpud3FkdGxnZ2t0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTA5MzUxOSwiZXhwIjoyMDc2NjY5NTE5fQ.asCr1qp1WDMYJn9SzqRK9dT1SJMD5DtVBuyfXCYZ-ME
   JWT_SECRET=your-production-jwt-secret-here-change-this
   PORT=3000
   BIND_HOST=0.0.0.0
   NODE_ENV=production
   ```

   **Important:** Change `JWT_SECRET` to a strong random string!

5. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete

## Step 3: Verify Deployment

1. **Check the deployment URL:**
   - Vercel will give you a URL like: `https://your-project.vercel.app`

2. **Test the API:**
   ```bash
   curl https://your-project.vercel.app/api/health
   # Should return: {"status":"ok"}
   ```

3. **Test Supabase:**
   ```bash
   curl https://your-project.vercel.app/api/supabase/health
   # Should return: {"ok":true,"url":"..."}
   ```

4. **Open your site:**
   - Visit: `https://your-project.vercel.app`
   - Homepage should load!

## Step 4: Create Database Table

Still needed even after deployment:

1. Go to Supabase: https://app.supabase.com/project/nvmftyzumznwqdtlggkt
2. Open SQL Editor
3. Run the users table SQL (see YOUR_PROJECT_IS_READY.md)
4. Test registration on your deployed site!

## Optional: Custom Domain

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Troubleshooting

### Deployment Fails

- Check that all dependencies are in `package.json`
- Verify environment variables are set correctly
- Check Vercel build logs for errors

### API Endpoints Not Working

- Verify environment variables are set
- Check Vercel function logs
- Make sure server.js is in the root directory

### Database Connection Issues

- Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
- Check Supabase project is active
- Review Vercel function logs

## Important Notes

### Security:
- ✅ Never commit `.env` to Git (it's already in `.gitignore`)
- ✅ Use strong JWT_SECRET in production
- ✅ Keep SUPABASE_SERVICE_ROLE_KEY secret
- ✅ Enable Supabase Row Level Security

### Performance:
- Vercel free tier has cold starts
- Consider upgrading for production
- Use Vercel Edge Functions for static content

### Monitoring:
- Check Vercel Analytics
- Set up error monitoring
- Monitor Supabase usage

## Environment Variables Reference

| Variable | Purpose | Required |
|----------|---------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Database access | Yes |
| `JWT_SECRET` | Token signing | Yes |
| `PORT` | Server port | No (auto) |
| `BIND_HOST` | Bind address | No (auto) |
| `NODE_ENV` | Environment | Yes |
| `PAYPAL_CLIENT_ID` | Payments | Optional |
| `PAYPAL_CLIENT_SECRET` | Payments | Optional |
| `PAYPAL_MODE` | Payments | Optional |

## Next Steps After Deployment

1. ✅ Test all features
2. ✅ Set up custom domain
3. ✅ Configure SSL/HTTPS (automatic on Vercel)
4. ✅ Set up monitoring
5. ✅ Configure backup strategy
6. ✅ Review security settings
7. ✅ Test payment processing (if enabled)

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Project Docs:** See README.md and other docs

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] API health check passes
- [ ] Supabase connection works
- [ ] Homepage loads
- [ ] Database table created
- [ ] User registration works
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up (optional)

---

**Congratulations! Your Success Sprout platform is now live on the web! 🎉**

