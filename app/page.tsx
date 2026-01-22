'use client';

import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { ClusteredIncident, ThreatType, SeverityLevel, Region } from '@/types/security';
import { StatsDashboard } from '@/components/stats-dashboard';
import { NigeriaMap } from '@/components/nigeria-map';
import { IncidentFeed } from '@/components/incident-feed';
import { IncidentFilters } from '@/components/incident-filters';
import { NotificationSettings } from '@/components/NotificationSettings';
import { useNotificationAlerts } from '@/hooks/useNotificationAlerts';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';
import { Shield, RefreshCw, Check, Sun, Moon, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { NotificationBell } from '@/components/NotificationBell';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface FilterOptions {
  threatTypes: ThreatType[];
  severities: SeverityLevel[];
  regions: Region[];
  states: string[];
}

export default function Home() {
  const [filters, setFilters] = useState<FilterOptions>({
    threatTypes: [],
    severities: [],
    regions: [],
    states: [],
  });

  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshComplete, setRefreshComplete] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [statsOpen, setStatsOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  const { isInstallable, isInstalled, triggerInstall } = usePWAInstall();
  
  const { data, error, isLoading, mutate } = useSWR('/api/news?limit=100', fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  });

  // Initialize notification alerts
  const { refresh: refreshAlerts } = useNotificationAlerts({
    enabled: true,
    alertConfig: {
      enabled: true,
      threatTypes: ['terrorism', 'banditry', 'kidnapping', 'insurgency', 'armed_attack'],
      minSeverity: 'high',
      states: [],
      notificationTypes: ['browser'],
    },
  });

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      // Default to dark mode
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }

    // Request notification permission on first visit
    if ('Notification' in window && Notification.permission === 'default') {
      // Delay request to avoid being blocked
      setTimeout(() => {
        Notification.requestPermission();
      }, 10000);
    }
  }, []);

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    
    if (newIsDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleInstall = async () => {
    await triggerInstall();
  };

  const incidents: ClusteredIncident[] = data?.data || [];

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      if (filters.threatTypes.length > 0 && !filters.threatTypes.includes(incident.threatType)) {
        return false;
      }

      if (filters.severities.length > 0 && !filters.severities.includes(incident.severity)) {
        return false;
      }

      if (filters.regions.length > 0 && incident.region && !filters.regions.includes(incident.region)) {
        return false;
      }

      if (selectedState && incident.state !== selectedState) {
        return false;
      }

      if (filters.states.length > 0 && incident.state && !filters.states.includes(incident.state)) {
        return false;
      }

      return true;
    });
  }, [incidents, filters, selectedState]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshComplete(false);
    await mutate();
    await refreshAlerts();
    // Small delay to show the success state
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshComplete(true);
      // Clear success indicator after 2 seconds
      setTimeout(() => setRefreshComplete(false), 2000);
    }, 500);
  };

  const handleStateClick = (state: string) => {
    setSelectedState(selectedState === state ? null : state);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Nigeria Security Intelligence</h1>
                <p className="text-sm text-muted-foreground">Real-time security monitoring across all 36 states + FCT</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="border-border"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading || isRefreshing}
                className={`border-border transition-all ${
                  refreshComplete ? 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/20 dark:border-green-700' : ''
                }`}
              >
                {isRefreshing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : refreshComplete ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                )}
                {isRefreshing ? 'Refreshing...' : refreshComplete ? 'Updated!' : 'Refresh'}
              </Button>

              <NotificationSettings />

              <NotificationBell />

              {/* Manual Install Button - Fallback for when automatic prompt doesn't show */}
              {isInstallable && !isInstalled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInstall}
                  className="border-border"
                  title="Install app"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Install
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-muted-foreground">Loading security intelligence...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="text-destructive mb-4">Failed to load data</p>
                <Button onClick={handleRefresh} variant="outline">
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Collapsible Stats Dashboard */}
              <Collapsible open={statsOpen} onOpenChange={setStatsOpen} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Security Overview</h2>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      {statsOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <StatsDashboard incidents={filteredIncidents} />
                </CollapsibleContent>
              </Collapsible>

              {/* Collapsible Nigeria Map */}
              <Collapsible open={mapOpen} onOpenChange={setMapOpen} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">National Security Map</h2>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      {mapOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <NigeriaMap incidents={filteredIncidents} onStateClick={handleStateClick} />
                </CollapsibleContent>
              </Collapsible>

              {selectedState && (
                <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-foreground">
                      Filtering by: <span className="font-semibold">{selectedState}</span>
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedState(null)}
                      className="text-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                  <IncidentFilters
                    filters={filters}
                    onFilterChange={setFilters}
                    stats={{
                      total: incidents.length,
                      filtered: filteredIncidents.length,
                    }}
                  />
                </div>

                <div id="incidents-feed" className="lg:col-span-3">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Live Security Feed</h2>
                    <p className="text-sm text-muted-foreground">
                      Last updated: {data?.meta?.lastUpdated ? new Date(data.meta.lastUpdated).toLocaleString() : 'N/A'}
                    </p>
                  </div>

                  {filteredIncidents.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                      <p>No incidents match your filters</p>
                    </div>
                  ) : (
                    <IncidentFeed incidents={filteredIncidents} />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Nigeria Security Intelligence Platform - Aggregating from {data?.meta?.totalIncidents || 0} sources
            </p>
            <p className="mt-2">
              Data from NewsAPI, GNews, Premium Times, Punch, Vanguard, Daily Trust, Channels TV, and more
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

