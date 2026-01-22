# Platform Features

Comprehensive overview of the Nigeria Security Intelligence Platform's capabilities.

## Intelligence Gathering

### Multi-Source Aggregation
- **News APIs**: NewsAPI, GNews with parallel fetching
- **RSS Feeds**: 8+ major Nigerian news outlets
- **Redundancy**: Automatic failover if sources are unavailable
- **Real-time**: 5-minute refresh intervals
- **Coverage**: 50-100 incidents monitored simultaneously

### Nigerian Media Sources
1. **Premium Times** - High reliability (0.9)
2. **Punch** - High reliability (0.85)
3. **Vanguard** - High reliability (0.85)
4. **Daily Trust** - High reliability (0.9)
5. **Channels TV** - High reliability (0.9)
6. **Sahara Reporters** - Medium reliability (0.75)
7. **Leadership** - Medium-high reliability (0.8)
8. **Guardian Nigeria** - High reliability (0.85)

## Threat Classification

### Automated Detection
- **Keyword Matching**: 100+ security-related keywords
- **Pattern Recognition**: Semantic analysis for context
- **Multi-category**: Single incident can match multiple threat types
- **Fallback**: Unknown incidents flagged for review

### Threat Categories
1. **Terrorism** - Boko Haram, ISWAP, bombings, IEDs
2. **Banditry** - Armed bandits, highway robbery, cattle rustling
3. **Kidnapping** - Abductions, hostage situations, ransom demands
4. **Insurgency** - Militant groups, separatist movements
5. **Communal Violence** - Ethnic clashes, herder-farmer conflicts
6. **Militancy** - Niger Delta activities, pipeline attacks
7. **Armed Attacks** - Shootings, ambushes, raids
8. **Security Operations** - Military/police operations, arrests
9. **Pipeline Attacks** - Oil infrastructure sabotage
10. **Emerging Threats** - New or unidentified threats

## Geographic Intelligence

### State-Level Tagging
- **37 Regions**: All 36 states + FCT covered
- **Automatic Detection**: State names, cities, LGAs identified
- **Confidence Scoring**: 0-100% location confidence
- **Multi-level**: State → Region → Zone mapping

### Location Identification Methods
1. **Direct State Mentions** - "Borno state" (95% confidence)
2. **City Recognition** - "Maiduguri" → Borno (80% confidence)
3. **LGA Mapping** - "Gwoza" → Borno (75% confidence)
4. **Regional Context** - "North-East Nigeria" (50% confidence)

### Geographic Regions
- **North-Central**: 7 states
- **North-East**: 6 states
- **North-West**: 7 states
- **South-East**: 5 states
- **South-South**: 6 states
- **South-West**: 6 states

## Deduplication & Clustering

### Intelligent Grouping
- **URL Normalization**: Removes duplicate articles
- **Title Similarity**: Text matching algorithm
- **Time-based**: 24-hour clustering window
- **Multi-source**: Groups reports from different outlets

### Similarity Algorithm
- **Text Analysis**: Word overlap comparison
- **Location Matching**: Same state/region priority
- **Threat Type**: Same category clustering
- **Time Window**: Events within 24 hours
- **Threshold**: 65% similarity required

### Incident Clustering
- **Primary Source**: Most reliable source selected
- **Source Count**: Tracks number of confirming sources
- **Confidence Boost**: More sources = higher confidence
- **Latest Update**: Tracks first and last report times

## Severity Assessment

### Four-Level System
1. **Critical** - Mass casualties, major attacks (20+ killed)
2. **High** - Deaths, injuries, significant violence (5+ killed)
3. **Moderate** - Violence with casualties (1-4 killed)
4. **Low** - Threats, warnings, minor incidents

### Severity Factors
- **Casualties**: Killed and injured counts
- **Keywords**: "massacre", "mass killing", "deadly"
- **Threat Type**: Terrorism higher than other types
- **Location**: Multiple states = higher severity

### Casualty Extraction
- **Automated Parsing**: Extracts numbers from text
- **Multiple Patterns**: "X killed", "death toll of X", "X dead"
- **Injured Count**: Separate tracking for wounded
- **Kidnapped**: Tracks abduction numbers

## Confidence Scoring

### Five-Level System
1. **Confirmed** - 5+ sources, verified details (85%+)
2. **High** - 3+ sources, casualties/location (65-84%)
3. **Medium** - 2+ sources, some details (45-64%)
4. **Low** - 1 source, casualties present (25-44%)
5. **Unconfirmed** - Single source, minimal details (<25%)

### Confidence Factors
- **Source Count**: More sources = higher confidence
- **Source Reliability**: Weighted by outlet reputation
- **Casualty Data**: Presence boosts confidence
- **Location Data**: Geographic details increase score

## User Interface

### Dashboard Components

#### Stats Cards
- **Total Incidents**: Current incident count
- **Critical Alerts**: High-severity incidents
- **Total Casualties**: Killed + injured aggregation
- **Affected States**: Number of states with incidents
- **Trends**: Percentage changes from previous period

#### Interactive Map
- **State Grid**: All 37 regions displayed
- **Color Coding**: Severity-based coloring
- **Click-to-Filter**: Instant state filtering
- **Incident Count**: Badge showing incidents per state
- **Regional Grouping**: Organized by geopolitical zones

#### Live Feed
- **Card Layout**: Each incident in detailed card
- **Key Information**: Title, description, source, time
- **Visual Indicators**: Severity badges, threat type tags
- **Casualty Display**: Deaths, injuries, kidnappings
- **Multi-source**: Shows number of confirming sources
- **External Links**: Direct links to original articles

### Filtering System

#### Filter Options
1. **Threat Type**: All 10 categories
2. **Severity**: Critical, High, Moderate, Low
3. **Region**: All 6 geopolitical zones
4. **State**: Click map or use filter panel
5. **Date Range**: Time-based filtering (planned)

#### Filter Behavior
- **Multi-select**: Choose multiple filters
- **AND Logic**: Filters combine (must match all)
- **Live Updates**: Instant result filtering
- **Count Display**: Shows filtered vs total
- **Clear All**: One-click filter reset

### Real-time Features
- **Auto-refresh**: Every 5 minutes
- **Manual Refresh**: Instant update button
- **Loading States**: Visual feedback during updates
- **Error Handling**: Graceful failure messages
- **Offline Support**: Cached data available

## Alerting System

### Browser Notifications
- **Permission Request**: One-time authorization
- **Critical Alerts**: Automatic for high-severity
- **Custom Triggers**: Configurable alert rules
- **Click Action**: Opens incident details
- **Persistent**: Critical alerts require interaction

### Webhook Integration
- **Custom Endpoints**: POST to any URL
- **Structured Payload**: JSON format
- **Retry Logic**: Automatic retry on failure
- **Multiple Webhooks**: Support for multiple endpoints

### Slack Integration
- **Rich Formatting**: Formatted message blocks
- **Severity Icons**: Visual severity indicators
- **Action Buttons**: Direct links to details
- **Field Display**: Location, sources, confidence
- **Threading**: Group related updates

### Alert Configuration
- **Threat Types**: Select which threats trigger alerts
- **Severity Threshold**: Minimum severity level
- **Geographic**: State/region-specific alerts
- **Notification Types**: Browser, webhook, Slack
- **Save Settings**: Persistent configuration

## Data Processing

### Processing Pipeline
1. **Fetch**: Parallel API/RSS requests
2. **Parse**: Extract article data
3. **Classify**: Threat detection
4. **Tag**: Geographic identification
5. **Extract**: Casualty numbers
6. **Score**: Severity calculation
7. **Deduplicate**: Remove duplicates
8. **Cluster**: Group related incidents
9. **Confidence**: Calculate validation score
10. **Deliver**: Send to frontend

### Performance Optimizations
- **Parallel Fetching**: All sources simultaneously
- **Caching**: 5-minute server-side cache
- **SWR**: Client-side caching with revalidation
- **Edge Functions**: Global CDN distribution
- **Lazy Loading**: Components load as needed

### Error Handling
- **Graceful Degradation**: Continue with available sources
- **Timeout Protection**: 10-second request timeout
- **Retry Logic**: Automatic retry on transient failures
- **Error Reporting**: Logs for debugging
- **User Feedback**: Clear error messages

## API Endpoints

### GET /api/news

Primary aggregation endpoint.

**Query Parameters:**
- `source`: Filter by source (all, newsapi, gnews, rss)
- `limit`: Maximum results (default: 50, max: 100)

**Response Format:**
```json
{
  "success": true,
  "data": [ClusteredIncident[]],
  "meta": {
    "total": number,
    "totalIncidents": number,
    "clustered": number,
    "lastUpdated": string
  }
}
```

**Rate Limiting:**
- Built-in caching reduces API calls
- Free tier sufficient for testing
- Production requires paid API tiers

## Security Features

### Data Validation
- **Input Sanitization**: All user inputs cleaned
- **Type Safety**: TypeScript throughout
- **API Key Protection**: Server-side only
- **CORS Headers**: Properly configured
- **Rate Limiting**: Prevents abuse

### Privacy
- **No User Data**: No personal information collected
- **Public Data Only**: All data from public sources
- **No Tracking**: No analytics by default
- **Local Storage**: Alert settings only

## Extensibility

### Easy Customization
- **Add Sources**: Simple RSS feed addition
- **Modify Keywords**: Update threat detection rules
- **Adjust Scoring**: Change severity calculations
- **Custom Filters**: Add new filter categories
- **Styling**: Tailwind CSS for easy theming

### Integration Ready
- **REST API**: Standard JSON responses
- **Webhooks**: Push notifications
- **Export**: Data export capabilities (planned)
- **Embeds**: Widget embedding (planned)

## Limitations

### By Design
- **News-based**: Only reports what media covers
- **Time Lag**: 5-15 minute delay by design
- **English Only**: Nigerian English-language sources
- **Public Data**: No classified intelligence

### Technical
- **API Limits**: Free tiers have daily quotas
- **Coverage Gaps**: Rural areas less covered
- **Location Accuracy**: ~85% geographic precision
- **Deduplication**: May occasionally cluster unrelated incidents

## Future Enhancements

### Planned Features
- [ ] Advanced search functionality
- [ ] Historical data analysis
- [ ] Trend analysis and predictions
- [ ] Email digest reports
- [ ] Mobile app
- [ ] Data export (CSV, JSON)
- [ ] Incident timeline view
- [ ] Heat map visualization
- [ ] Social media integration
- [ ] Machine learning classification

### Potential Integrations
- WhatsApp alerts
- Telegram bot
- Twitter monitoring
- Official security feeds
- International news sources
- Academic research databases

---

This platform represents a comprehensive approach to security intelligence aggregation, providing decision-makers with actionable information about security incidents across Nigeria.
