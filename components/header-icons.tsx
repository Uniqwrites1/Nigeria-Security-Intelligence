'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/NotificationBell';
import { NotificationSettings } from '@/components/NotificationSettings';

interface HeaderIconsProps {
  isDarkMode: boolean | undefined;
  toggleTheme: () => void;
  isLoading: boolean;
  isRefreshing: boolean;
  refreshComplete: boolean;
  handleRefresh: () => void;
  isInstallable: boolean;
  isInstalled: boolean | undefined;
  handleInstall: () => void;
  statsOpen: boolean;
  setStatsOpen: (open: boolean) => void;
  mapOpen: boolean;
  setMapOpen: (open: boolean) => void;
}

// SVG icon components with hydration-safe rendering
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function RefreshCwIcon({ className, animate }: { className?: string; animate?: boolean }) {
  return (
    <svg className={`${className} ${animate ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

export function HeaderIcons({
  isDarkMode,
  toggleTheme,
  isLoading,
  isRefreshing,
  refreshComplete,
  handleRefresh,
  isInstallable,
  isInstalled,
  handleInstall,
  statsOpen,
  setStatsOpen,
  mapOpen,
  setMapOpen,
}: HeaderIconsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Notification Bell & Settings */}
      {mounted && (
        <>
          <NotificationBell />
          <NotificationSettings />
        </>
      )}

      {/* Theme Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleTheme}
        className="border-border"
        suppressHydrationWarning
      >
        {mounted && (
          isDarkMode ? (
            <SunIcon className="w-4 h-4" />
          ) : (
            <MoonIcon className="w-4 h-4" />
          )
        )}
      </Button>

      {/* Refresh Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isLoading || isRefreshing}
        className={`border-border transition-all ${
          refreshComplete ? 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/20 dark:border-green-700' : ''
        }`}
        suppressHydrationWarning
      >
        {mounted && (
          <>
            {isRefreshing ? (
              <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" animate />
            ) : refreshComplete ? (
              <CheckIcon className="w-4 h-4 mr-2" />
            ) : (
              <RefreshCwIcon className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} animate={isRefreshing} />
            )}
            {isRefreshing ? 'Refreshing...' : refreshComplete ? 'Updated!' : 'Refresh'}
          </>
        )}
      </Button>

      {/* Manual Install Button */}
      {isInstallable && !isInstalled && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleInstall}
          className="border-border"
          title="Install app"
          suppressHydrationWarning
        >
          <DownloadIcon className="w-4 h-4 mr-2" />
          Install
        </Button>
      )}

      {/* Stats Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setStatsOpen(!statsOpen)}
        className="text-muted-foreground"
        suppressHydrationWarning
      >
        {mounted && (statsOpen ? (
          <ChevronUpIcon className="w-4 h-4" />
        ) : (
          <ChevronDownIcon className="w-4 h-4" />
        ))}
      </Button>

      {/* Map Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMapOpen(!mapOpen)}
        className="text-muted-foreground"
        suppressHydrationWarning
      >
        {mounted && (mapOpen ? (
          <ChevronUpIcon className="w-4 h-4" />
        ) : (
          <ChevronDownIcon className="w-4 h-4" />
        ))}
      </Button>
    </>
  );
}

// Separate component for the logo icon
export function LogoIcon() {
  return (
    <div className="p-2 bg-red-600 rounded-lg" suppressHydrationWarning>
      <ShieldIcon className="w-6 h-6 text-white" />
    </div>
  );
}

export default HeaderIcons;

