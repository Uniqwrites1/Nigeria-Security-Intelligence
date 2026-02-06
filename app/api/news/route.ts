import { NextRequest, NextResponse } from 'next/server';
import { SecurityIncident } from '@/types/security';
import {
  getPrimaryThreatType,
  calculateSeverity,
  extractCasualties,
  extractTags,
  isSecurityRelated,
  calculateConfidence
} from '@/lib/threat-detection';
import { enrichWithGeoData } from '@/lib/geo-tagging';
import { removeDuplicates, clusterIncidents } from '@/lib/deduplication';

const NIGERIAN_RSS_FEEDS = [
  { name: 'Premium Times', url: 'https://www.premiumtimesng.com/feed', reliability: 0.9 },
  { name: 'Punch', url: 'https://punchng.com/feed/', reliability: 0.85 },
  { name: 'Vanguard', url: 'https://www.vanguardngr.com/feed/', reliability: 0.85 },
  { name: 'Daily Trust', url: 'https://dailytrust.com/feed/', reliability: 0.9 },
  { name: 'Channels TV', url: 'https://www.channelstv.com/feed/', reliability: 0.9 },
  { name: 'Sahara Reporters', url: 'http://saharareporters.com/feeds/latest/feed', reliability: 0.75 },
  { name: 'Leadership', url: 'https://leadership.ng/feed/', reliability: 0.8 },
  { name: 'Guardian Nigeria', url: 'https://guardian.ng/feed/', reliability: 0.85 },
  { name: 'Bellanaija', url: 'https://www.bellanaija.com/feed/', reliability: 0.7 },
  { name: 'Business Day', url: 'https://www.businessday.ng/feed/', reliability: 0.85 },
  { name: 'Linda Ikeji\'s Blog', url: 'https://lindaikejisblog.com/feed', reliability: 0.65 },
  { name: 'Nairametrics', url: 'https://nairametrics.com/feed/', reliability: 0.85 },
  { name: 'Nation', url: 'https://www.thenationonlineng.net/feed/', reliability: 0.8 },
  { name: 'TechCabal', url: 'https://techcabal.com/feed/', reliability: 0.75 },
  { name: 'Tekedia', url: 'https://tekedia.com/feed/', reliability: 0.7 },
  { name: 'ThisDay', url: 'https://www.thisdaylive.com/feed/', reliability: 0.85 },
  { name: 'TVC News', url: 'https://tvcnews.tv/feed/', reliability: 0.85 },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get('source') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    
    // Add cache control headers for real-time data
    const headers = {
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    };

    const incidents: SecurityIncident[] = [];

    if (source === 'all' || source === 'newsapi') {
      const newsApiIncidents = await fetchFromNewsAPI();
      incidents.push(...newsApiIncidents);
    }

    if (source === 'all' || source === 'gnews') {
      const gNewsIncidents = await fetchFromGNews();
      incidents.push(...gNewsIncidents);
    }

    if (source === 'all' || source === 'rss') {
      const rssIncidents = await fetchFromRSS();
      incidents.push(...rssIncidents);
    }

    const securityIncidents = incidents.filter(incident =>
      isSecurityRelated(`${incident.title} ${incident.description}`)
    );

    const uniqueIncidents = removeDuplicates(securityIncidents);

    const clustered = clusterIncidents(uniqueIncidents);
    
    // Sort by published date (newest first)
    clustered.sort((a, b) => {
      const dateA = new Date(a.firstReported).getTime();
      const dateB = new Date(b.firstReported).getTime();
      return dateB - dateA;
    });

    const limited = clustered.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: limited,
      meta: {
        total: limited.length,
        totalIncidents: uniqueIncidents.length,
        clustered: limited.length,
        lastUpdated: new Date().toISOString(),
      }
    }, { headers });
  } catch (error) {
    console.error('News aggregation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news data' },
      { status: 500 }
    );
  }
}

async function fetchFromNewsAPI(): Promise<SecurityIncident[]> {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) {
    console.warn('NewsAPI key not configured');
    return [];
  }

  try {
    const securityKeywords = 'security OR attack OR terrorism OR kidnapping OR banditry OR violence OR military';
    // Don't use date filter - let the API return all articles, we'll handle filtering in frontend
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(securityKeywords)}&language=en&domains=premiumtimesng.com,punchng.com,vanguardngr.com,dailytrust.com,channelstv.com,saharareporters.com,leadership.ng,guardian.ng,bellanaija.com,businessday.ng,nairametrics.com,thenationonlineng.net,techcabal.com,tekedia.com,thisdaylive.com,tvcnews.tv,lindaikejisblog.com&sortBy=publishedAt&pageSize=100&apiKey=${apiKey}`;

    const response = await fetch(url, { 
      next: { revalidate: 10 },
      headers: { 'Cache-Control': 'no-cache, must-revalidate' }
    });

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.articles) return [];

    return data.articles.map((article: any) => processArticle(article, 'NewsAPI', 'api', 0.85));
  } catch (error) {
    console.error('NewsAPI fetch error:', error);
    return [];
  }
}

async function fetchFromGNews(): Promise<SecurityIncident[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    console.warn('GNews API key not configured');
    return [];
  }

  try {
    const securityKeywords = 'security attack terrorism kidnapping banditry violence Nigeria';
    // Don't use date filter - let the API return all articles
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(securityKeywords)}&lang=en&country=ng&max=100&apikey=${apiKey}`;

    const response = await fetch(url, { 
      next: { revalidate: 10 },
      headers: { 'Cache-Control': 'no-cache, must-revalidate' }
    });

    if (!response.ok) {
      throw new Error(`GNews error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.articles) return [];

    return data.articles.map((article: any) => processArticle(article, 'GNews', 'api', 0.85));
  } catch (error) {
    console.error('GNews fetch error:', error);
    return [];
  }
}

async function fetchFromRSS(): Promise<SecurityIncident[]> {
  const allIncidents: SecurityIncident[] = [];

  const fetchPromises = NIGERIAN_RSS_FEEDS.map(async (feed) => {
    try {
      const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&api_key=${process.env.RSS2JSON_API_KEY || 'demo'}&count=30`, {
        next: { revalidate: 30 },
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (!response.ok) return [];

      const data = await response.json();

      if (!data.items) return [];

      return data.items
        .filter((item: any) => isSecurityRelated(`${item.title} ${item.description || ''}`))
        .map((item: any) => processArticle(
          {
            title: item.title,
            description: item.description || item.content || '',
            content: item.content || item.description || '',
            url: item.link || item.guid,
            publishedAt: item.pubDate,
            source: { name: feed.name },
            urlToImage: item.thumbnail || item.enclosure?.link,
          },
          feed.name,
          'rss',
          feed.reliability
        ));
    } catch (error) {
      console.error(`RSS fetch error for ${feed.name}:`, error);
      return [];
    }
  });

  const results = await Promise.allSettled(fetchPromises);

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      allIncidents.push(...result.value);
    }
  });

  return allIncidents;
}

function processArticle(
  article: any,
  sourceName: string,
  sourceType: 'api' | 'rss' | 'official',
  sourceReliability: number
): SecurityIncident {
  const title = article.title || '';
  const description = article.description || article.content || '';
  const content = article.content || article.description || '';

  const combinedText = `${title} ${description} ${content}`;

  const threatType = getPrimaryThreatType(combinedText);
  const casualties = extractCasualties(combinedText);
  const severity = calculateSeverity(combinedText, casualties);
  const tags = extractTags(combinedText, threatType);

  const geoData = enrichWithGeoData(title, description, content);

  const confidence = calculateConfidence(
    1,
    sourceReliability,
    !!casualties,
    !!geoData.state
  );

  const id = `${sourceName}-${Date.parse(article.publishedAt || new Date().toISOString())}-${title.substring(0, 20).replace(/\s+/g, '-')}`;

  return {
    id,
    title,
    description: description.substring(0, 300),
    content: content.substring(0, 1000),
    url: article.url || article.link || '',
    publishedAt: article.publishedAt || article.pubDate || new Date().toISOString(),
    source: sourceName,
    sourceType,
    threatType,
    severity,
    confidence,
    state: geoData.state,
    region: geoData.region,
    location: geoData.location,
    casualties,
    imageUrl: article.urlToImage || article.thumbnail || article.image,
    tags,
    rawData: article,
  };
}
