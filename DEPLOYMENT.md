# Deployment Guide

This guide covers deploying the Nigeria Security Intelligence Platform to Vercel.

## Prerequisites

1. Vercel account (free tier works)
2. GitHub repository with your code
3. API keys from required services

## Step 1: Prepare Your Repository

1. Ensure all code is committed and pushed to GitHub:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

2. Verify `.env.example` is in your repository (API keys should NOT be committed)

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `next build`
   - **Output Directory**: `.next`

5. Add Environment Variables (see Step 3)

6. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts:
   - Link to existing project or create new
   - Confirm settings
   - Add environment variables when prompted

5. Deploy to production:
```bash
vercel --prod
```

## Step 3: Configure Environment Variables

In the Vercel Dashboard, go to your project's Settings > Environment Variables and add:

### Required Variables

```
NEWSAPI_KEY=your_newsapi_key_here
GNEWS_API_KEY=your_gnews_api_key_here
RSS2JSON_API_KEY=your_rss2json_key_or_demo
```

### Optional Variables

```
WEBHOOK_URL=https://your-webhook-endpoint.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
NEXT_PUBLIC_APP_URL=https://your-deployed-url.vercel.app
```

### Important Notes

- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Other variables are server-side only
- Redeploy after adding/changing environment variables

## Step 4: Configure API Keys

### NewsAPI

1. Sign up at [newsapi.org](https://newsapi.org/)
2. Verify your email
3. Copy your API key from the dashboard
4. Add to Vercel environment variables as `NEWSAPI_KEY`

**Rate Limits (Free Tier):**
- 100 requests per day
- 500 requests per day (paid)

### GNews API

1. Sign up at [gnews.io](https://gnews.io/)
2. Verify your email
3. Copy your API key
4. Add to Vercel environment variables as `GNEWS_API_KEY`

**Rate Limits (Free Tier):**
- 100 requests per day

### RSS2JSON (Optional)

1. Sign up at [rss2json.com](https://rss2json.com/)
2. Get API key (or use `demo` for testing)
3. Add to Vercel environment variables as `RSS2JSON_API_KEY`

**Rate Limits:**
- Demo: 10,000 requests per day
- Free: 10,000 requests per day
- Pro: Unlimited

## Step 5: Verify Deployment

1. Wait for deployment to complete (usually 1-2 minutes)
2. Click the deployment URL
3. Verify the dashboard loads
4. Check browser console for errors
5. Test the refresh button
6. Verify incidents are loading

### Common Issues

**No data loading:**
- Check API keys are correct in Vercel dashboard
- Verify API keys have sufficient quota
- Check Vercel function logs for errors

**Build errors:**
- Run `npm run build` locally first
- Check for TypeScript errors
- Verify all dependencies are in package.json

**API rate limits:**
- Upgrade to paid API tiers
- Implement request caching
- Reduce refresh frequency

## Step 6: Domain Configuration (Optional)

### Add Custom Domain

1. Go to Project Settings > Domains
2. Add your domain (e.g., `security.example.com`)
3. Configure DNS:
   - **A Record**: `76.76.21.21`
   - **CNAME**: `cname.vercel-dns.com`
4. Wait for DNS propagation (5-60 minutes)
5. Vercel will automatically provision SSL

## Step 7: Performance Optimization

### Edge Functions

Your API routes automatically use Vercel Edge Functions for:
- Global CDN distribution
- Low latency worldwide
- Automatic caching

### Caching Strategy

Default caching is configured in the API routes:
```typescript
{ next: { revalidate: 300 } } // 5 minutes
```

To adjust:
1. Edit `app/api/news/route.ts`
2. Change `revalidate` value (in seconds)
3. Redeploy

### Analytics

Enable Vercel Analytics:
1. Go to Project Settings > Analytics
2. Enable Web Analytics
3. Redeploy

## Step 8: Monitoring

### Vercel Logs

1. Go to your project dashboard
2. Click "Functions" tab
3. View real-time logs
4. Filter by API route

### Error Tracking

Add error tracking:
1. Set up Sentry or similar
2. Add DSN to environment variables
3. Configure in `next.config.js`

### Uptime Monitoring

Recommended services:
- UptimeRobot (free)
- Pingdom
- StatusCake

Monitor:
- Main dashboard URL
- `/api/news` endpoint

## Step 9: Continuous Deployment

Vercel automatically deploys on:
- Push to main branch (production)
- Push to other branches (preview)

### Branch Deployments

Each branch gets a unique preview URL:
```
https://your-project-git-branch-name.vercel.app
```

### Rollback

If something breaks:
1. Go to Deployments tab
2. Find last working deployment
3. Click "..." menu
4. Select "Promote to Production"

## Production Checklist

Before going live:

- [ ] All API keys configured
- [ ] API keys are production-tier
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Error tracking setup
- [ ] Uptime monitoring active
- [ ] Tested all features in production
- [ ] Verified browser notifications work
- [ ] Tested on multiple devices
- [ ] Documented for team/users

## Scaling Considerations

### Traffic Growth

Free tier includes:
- 100GB bandwidth
- 100 GB-hours serverless execution
- Unlimited websites

Upgrade if you need:
- More bandwidth
- Faster builds
- Priority support

### API Rate Limits

Monitor API usage:
- NewsAPI: Check dashboard
- GNews: Check usage stats
- RSS2JSON: Monitor requests

Upgrade when approaching limits.

## Troubleshooting

### Build Fails

```bash
# Test build locally
npm run build

# Check types
npm run typecheck

# Clear cache
rm -rf .next
npm run build
```

### API Errors

1. Check Vercel function logs
2. Verify API keys in environment variables
3. Test API keys directly:
```bash
curl "https://newsapi.org/v2/everything?q=nigeria&apiKey=YOUR_KEY"
```

### Slow Loading

1. Check API response times in logs
2. Verify caching is working
3. Consider adding a loading skeleton
4. Optimize images if any

## Support

- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Vercel Discord: [vercel.com/discord](https://vercel.com/discord)
- GitHub Issues: Open an issue in your repository

## Security Notes

- Never commit `.env.local` to GitHub
- Rotate API keys regularly
- Use Vercel's environment variables (encrypted at rest)
- Enable Vercel Authentication if needed
- Monitor for unusual API usage
- Set up rate limiting for production

## Cost Optimization

Free tier is sufficient for:
- Personal projects
- Small teams
- Low to moderate traffic

Consider paid tier ($20/month) for:
- High traffic
- Business use
- Premium support
- Advanced analytics

---

Your Nigeria Security Intelligence Platform should now be live and operational on Vercel!
