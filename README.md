# Nigeria Security Intelligence Platform

A comprehensive, real-time security news aggregation and intelligence platform for Nigeria. This platform monitors and analyzes security-related incidents across all 36 states and the Federal Capital Territory (FCT), providing actionable intelligence for security professionals, analysts, and decision-makers.

## Features

### Core Capabilities
- **Multi-Source Aggregation**: Automatically collects security news from multiple APIs and RSS feeds
- **Intelligent Classification**: AI-powered threat detection and categorization system
- **Geographic Tagging**: Automatic state and region identification for all incidents
- **Deduplication & Clustering**: Groups related reports from multiple sources
- **Severity Scoring**: Intelligent severity assessment based on casualties and keywords
- **Confidence Levels**: Multi-source validation with confidence scoring
- **Real-time Updates**: Auto-refreshing feed with 5-minute intervals
- **Advanced Filtering**: Filter by threat type, severity, state, and region
- **Interactive Map**: Visual representation of incidents across Nigerian states
- **Browser Notifications**: Real-time alerts for critical incidents

### Threat Categories Monitored
- Terrorism
- Banditry
- Kidnapping/Abduction
- Insurgency
- Communal/Ethnic Violence
- Militancy/Pipeline Attacks
- Armed Attacks
- Security Force Operations
- Emerging Threats

### Data Sources

#### News APIs
- NewsAPI
- GNews API
- RSS2JSON (for RSS feed parsing)

#### Nigerian Media RSS Feeds
- Premium Times
- Punch
- Vanguard
- Daily Trust
- Channels TV
- Sahara Reporters
- Leadership
- Guardian Nigeria

## Technology Stack

- **Framework**: Next.js 13 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Data Fetching**: SWR (with auto-revalidation)
- **RSS Parsing**: xml2js
- **Date Handling**: date-fns
- **Deployment**: Vercel

## Installation

### Prerequisites
- Node.js 18+ and npm
- API keys for news services (see Configuration section)

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd nigeria-security-intelligence
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Configure your API keys in `.env.local`:
```env
NEWSAPI_KEY=your_newsapi_key_here
GNEWS_API_KEY=your_gnews_api_key_here
RSS2JSON_API_KEY=your_rss2json_key_or_use_demo
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### Required API Keys

#### NewsAPI (Required)
1. Sign up at [newsapi.org](https://newsapi.org/)
2. Get your API key from the dashboard
3. Add to `.env.local` as `NEWSAPI_KEY`

#### GNews API (Required)
1. Sign up at [gnews.io](https://gnews.io/)
2. Get your API key
3. Add to `.env.local` as `GNEWS_API_KEY`

#### RSS2JSON (Optional)
1. Sign up at [rss2json.com](https://rss2json.com/)
2. Get your API key (or use 'demo' for testing)
3. Add to `.env.local` as `RSS2JSON_API_KEY`

### Optional Configurations

#### Webhook Alerts
```env
WEBHOOK_URL=https://your-webhook-endpoint.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

## Architecture

### Intelligence Processing Pipeline

1. **Data Collection**
   - Parallel fetching from multiple APIs and RSS feeds
   - Graceful degradation if sources fail
   - 5-minute cache revalidation

2. **Threat Detection**
   - Keyword-based pattern matching
   - Semantic analysis for threat classification
   - Multi-category tagging

3. **Geographic Tagging**
   - State name recognition
   - City-to-state mapping
   - LGA (Local Government Area) identification
   - Regional grouping

4. **Deduplication**
   - URL normalization
   - Title similarity analysis
   - Time-based clustering (24-hour window)
   - Multi-source incident grouping

5. **Scoring**
   - Severity calculation (casualties + keywords)
   - Confidence scoring (sources + validation)
   - Source reliability weighting

### Project Structure

```
nigeria-security-intelligence/
├── app/
│   ├── api/
│   │   └── news/
│   │       └── route.ts          # News aggregation API
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main dashboard
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── incident-feed.tsx         # Incident display
│   ├── incident-filters.tsx      # Filter controls
│   ├── nigeria-map.tsx           # Interactive map
│   └── stats-dashboard.tsx       # Statistics display
├── lib/
│   ├── threat-detection.ts       # AI classification engine
│   ├── geo-tagging.ts           # Geographic identification
│   ├── deduplication.ts         # Clustering algorithm
│   ├── nigeria-states.ts        # State data
│   └── alerting.ts              # Alert system
├── types/
│   └── security.ts              # TypeScript definitions
└── .env.example                 # Environment template
```

## API Endpoints

### GET /api/news

Aggregates security news from all configured sources.

**Query Parameters:**
- `source` (optional): Filter by source (`all`, `newsapi`, `gnews`, `rss`)
- `limit` (optional): Maximum number of results (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "unique-incident-id",
      "title": "Security incident title",
      "incidents": [...],
      "totalSources": 3,
      "confidence": "high",
      "severity": "high",
      "threatType": "terrorism",
      "state": "Borno",
      "region": "North-East",
      ...
    }
  ],
  "meta": {
    "total": 25,
    "totalIncidents": 45,
    "clustered": 25,
    "lastUpdated": "2024-01-20T10:30:00Z"
  }
}
```

## Usage Guide

### Dashboard Overview

1. **Stats Cards**: Quick overview of total incidents, critical alerts, casualties, and affected states
2. **Interactive Map**: Click on states to filter incidents by location
3. **Filter Panel**: Refine results by threat type, severity, and region
4. **Live Feed**: Real-time incident cards with full details
5. **Refresh Button**: Manually refresh data from all sources

### Filtering Incidents

- **By Threat Type**: Click badges in the filter panel
- **By Severity**: Select critical, high, moderate, or low
- **By Region**: Filter by geopolitical zones
- **By State**: Click states on the map

### Browser Notifications

1. Click "Allow" when prompted for notification permissions
2. Critical and high-severity incidents will trigger notifications
3. Click notifications to view full details

## Deployment to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

```bash
npm run build    # Test production build locally
vercel          # Deploy to Vercel
```

## Data Coverage

### Geographic Coverage
- All 36 Nigerian states
- Federal Capital Territory (FCT)
- 6 geopolitical regions

### Temporal Coverage
- Real-time news (past 24-48 hours)
- Auto-refresh every 5 minutes
- Incident clustering within 24-hour windows

### Source Coverage
- 8+ major Nigerian news outlets
- 2+ international news APIs
- Official security sources (when available)

## Reliability & Limitations

### Strengths
- Multiple redundant sources
- Automatic failover
- Source reliability weighting
- Multi-source validation

### Limitations
- Dependent on news reporting (not exhaustive)
- API rate limits apply
- Geographic tagging ~85% accuracy
- 5-minute data lag (by design)

### Known Issues
- Some rural incidents may lack precise location data
- RSS feeds may have inconsistent formats
- Free API tiers have usage limits

## Best Practices

1. **API Keys**: Use production API keys with higher rate limits
2. **Monitoring**: Set up uptime monitoring for the platform
3. **Caching**: Leverage Vercel's edge caching for performance
4. **Alerts**: Configure Slack/webhook alerts for critical incidents
5. **Backup**: Consider secondary deployment for high availability

## Contributing

This is a security intelligence platform. Contributions should focus on:
- Adding more reliable data sources
- Improving classification accuracy
- Enhancing geographic tagging
- Optimizing deduplication logic

## Security Considerations

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Implement rate limiting for production
- Monitor for unusual API usage
- Regular security audits recommended

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Review existing documentation
- Check API provider status pages

## Acknowledgments

- Nigerian media outlets for RSS feeds
- NewsAPI, GNews for API access
- Open-source community for tools and libraries

---

**Disclaimer**: This platform aggregates publicly available news. It is not a replacement for official security briefings or intelligence. Always verify critical information through official channels.
