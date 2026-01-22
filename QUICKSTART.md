# Quick Start Guide

Get the Nigeria Security Intelligence Platform running in under 5 minutes.

## Prerequisites

- Node.js 18+ installed
- API keys ready (see below)

## Step 1: Get API Keys (2 minutes)

### NewsAPI (Required)
1. Visit [newsapi.org](https://newsapi.org/)
2. Click "Get API Key"
3. Sign up with your email
4. Copy your API key

### GNews (Required)
1. Visit [gnews.io](https://gnews.io/)
2. Click "Sign Up"
3. Verify your email
4. Copy your API key from dashboard

### RSS2JSON (Optional)
1. Visit [rss2json.com](https://rss2json.com/)
2. Sign up for free tier
3. Get API key (or use `demo`)

## Step 2: Setup Project (1 minute)

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local and add your API keys
# NEWSAPI_KEY=your_key_here
# GNEWS_API_KEY=your_key_here
# RSS2JSON_API_KEY=demo
```

## Step 3: Run the Platform (30 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## What You'll See

1. **Stats Dashboard** - Overview of incidents, casualties, and affected states
2. **Interactive Map** - Click on states to filter incidents
3. **Filter Panel** - Refine by threat type, severity, and region
4. **Live Feed** - Real-time security incidents from all sources

## First Steps

1. **Wait for Data to Load** - Initial load takes 5-10 seconds
2. **Click Refresh** - Manually refresh to get latest incidents
3. **Try Filtering** - Click on threat types or severity levels
4. **Explore Map** - Click on states to see regional incidents
5. **Enable Notifications** - Click "Allow" when prompted

## Common Issues

### No Data Loading?
- Check your API keys are correct
- Verify API keys have active subscriptions
- Check browser console for errors

### Build Errors?
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### API Rate Limits?
- Free tiers have daily limits (100 requests/day)
- Upgrade to paid tiers for production use
- Consider caching strategies

## Next Steps

1. **Deploy to Vercel** - See [DEPLOYMENT.md](./DEPLOYMENT.md)
2. **Customize Filters** - Adjust threat detection in `lib/threat-detection.ts`
3. **Add More Sources** - Configure additional RSS feeds
4. **Set Up Alerts** - Configure Slack/webhook notifications

## Need Help?

- Check the full [README.md](./README.md)
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
- Open an issue on GitHub

## Testing the Platform

### Test the API Directly
```bash
# Should return security incidents
curl http://localhost:3000/api/news?limit=5
```

### Test Individual Sources
```bash
# Test NewsAPI only
curl http://localhost:3000/api/news?source=newsapi&limit=5

# Test GNews only
curl http://localhost:3000/api/news?source=gnews&limit=5

# Test RSS feeds only
curl http://localhost:3000/api/news?source=rss&limit=5
```

## Platform Features at a Glance

- **Coverage**: All 36 Nigerian states + FCT
- **Sources**: 8+ Nigerian media outlets + 2 news APIs
- **Categories**: 10 threat types monitored
- **Updates**: Auto-refresh every 5 minutes
- **Filtering**: By type, severity, state, region
- **Clustering**: Automatic duplicate detection
- **Scoring**: Severity and confidence ratings
- **Alerts**: Browser notifications for critical incidents

---

You're all set! The platform is now monitoring security incidents across Nigeria in real-time.
