'use client';

import { useState, useEffect } from 'react';
import { TimeDisplayMode, getTimeDisplayMode, setTimeDisplayMode } from '@/lib/formatTime';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

export function TimeDisplayToggle() {
  const [mode, setMode] = useState<TimeDisplayMode>('relative');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMode(getTimeDisplayMode());
  }, []);

  if (!mounted) return null;

  const modes: Array<{ value: TimeDisplayMode; label: string; title: string }> = [
    { value: 'relative', label: '3h ago', title: 'Relative time' },
    { value: 'absolute', label: 'Feb 6, 3:30 PM', title: 'Absolute (local)' },
    { value: 'lagos-timezone', label: 'Lagos time', title: 'Lagos timezone' },
  ];

  const handleModeChange = (newMode: TimeDisplayMode) => {
    setMode(newMode);
    setTimeDisplayMode(newMode);
    // Trigger a page re-render by dispatching a custom event
    window.dispatchEvent(new CustomEvent('timeDisplayModeChanged', { detail: newMode }));
  };

  return (
    <div className="flex items-center gap-1" title="Time display format">
      <Clock className="w-4 h-4 text-muted-foreground" />
      {modes.map((m) => (
        <Button
          key={m.value}
          variant={mode === m.value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleModeChange(m.value)}
          className="text-xs"
          title={m.title}
        >
          {m.label}
        </Button>
      ))}
    </div>
  );
}
