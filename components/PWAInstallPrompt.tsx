'use client';

import { useState, useEffect } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Drawer, 
  DrawerContent, 
  DrawerDescription, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerTitle 
} from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Download, X, Smartphone, CheckCircle2 } from 'lucide-react';

interface PWAInstallPromptProps {
  title?: string;
  description?: string;
  delay?: number;
  position?: 'bottom' | 'top';
}

export function PWAInstallPrompt({
  title = 'Install Nigeria Security Intel',
  description = 'Get real-time security alerts and access the dashboard offline by installing our app.',
  delay = 5000,
  position = 'bottom',
}: PWAInstallPromptProps) {
  const { isInstallable, isInstalled, isPromptActive, triggerInstall, dismissPrompt } = usePWAInstall();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [hasManuallyClosed, setHasManuallyClosed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // Don't render until mounted (hydration safety)
  if (!mounted) {
    return null;
  }

  // Auto-show after delay if not manually closed and has installability
  useEffect(() => {
    if (!hasManuallyClosed && !isOpen && !isInstalled) {
      const timer = setTimeout(() => {
        // Check if manifest is valid and prompt can be shown
        if (isInstallable || isPromptActive) {
          setIsOpen(true);
        }
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [delay, hasManuallyClosed, isOpen, isInstalled, isInstallable, isPromptActive]);

  // Don't show if prompt was dismissed (only for manual dismiss)
  if (hasManuallyClosed && !isOpen) {
    return null;
  }

  const handleInstall = async () => {
    const success = await triggerInstall();
    if (success) {
      setIsOpen(false);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    setHasManuallyClosed(true);
    dismissPrompt();
  };

  // Mobile uses drawer, desktop uses dialog
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen} direction={position}>
        <DrawerContent className="bg-background">
          <DrawerHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            <DrawerTitle className="text-xl font-bold">{title}</DrawerTitle>
            <DrawerDescription className="text-base">{description}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="flex flex-row gap-3 px-4">
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Not Now
            </Button>
            <Button 
              onClick={handleInstall}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <Download className="w-4 h-4 mr-2" />
              Install
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-background">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Smartphone className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-base">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 py-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>Real-time push notifications</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>Works offline</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>Quick access from home screen</span>
          </div>
        </div>

        <DialogFooter className="flex flex-row gap-3 sm:justify-center">
          <Button 
            variant="outline" 
            onClick={handleDismiss}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Not Now
          </Button>
          <Button 
            onClick={handleInstall}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            <Download className="w-4 h-4 mr-2" />
            Install App
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Inline banner variant
export function PWAInstallBanner({ position = 'bottom' }: { position?: 'bottom' | 'top' }) {
  const { isInstallable, isInstalled, isPromptActive, triggerInstall, dismissPrompt } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);
  const [hasManuallyClosed, setHasManuallyClosed] = useState(false);

  if (isInstalled) {
    return null;
  }

  // Show after user interaction
  const handleInteraction = () => {
    if ((isPromptActive || isInstallable) && !hasManuallyClosed) {
      setIsVisible(true);
    }
  };

  if (!isVisible || hasManuallyClosed) {
    return null;
  }

  return (
    <div className={`
      fixed z-50 left-0 right-0 p-4
      ${position === 'bottom' ? 'bottom-0' : 'top-0'}
    `}>
      <div className="container mx-auto">
        <div className="bg-card border border-border rounded-lg shadow-lg p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Install App</p>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Get real-time security alerts
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                dismissPrompt();
                setHasManuallyClosed(true);
                setIsVisible(false);
              }}
            >
              Later
            </Button>
            <Button 
              size="sm"
              onClick={async () => {
                await triggerInstall();
                setIsVisible(false);
              }}
              className="bg-primary hover:bg-primary/90"
            >
              <Download className="w-4 h-4 mr-2" />
              Install
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PWAInstallPrompt;

