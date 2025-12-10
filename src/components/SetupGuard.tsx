import { useEffect, useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isSupabaseConfigured, getSupabaseClient } from '@/lib/supabase-wrapper';
import { Loader2 } from 'lucide-react';

interface SetupGuardProps {
  children: ReactNode;
}

export const SetupGuard = ({ children }: SetupGuardProps) => {
  const [checking, setChecking] = useState(true);
  const [configured, setConfigured] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkSetupAccess = async () => {
      // Check if already on setup page
      if (location.pathname === '/setup') {
        // Check if setup is locked in database
        if (isSupabaseConfigured()) {
          try {
            const supabase = getSupabaseClient();
            if (supabase) {
              const { data } = await supabase
                .from('settings')
                .select('setup_locked')
                .maybeSingle();
              
              if (data?.setup_locked) {
                // Setup is locked, redirect to home
                navigate('/', { replace: true });
                setChecking(false);
                return;
              }
            }
          } catch (error) {
            // If error, allow access to setup
            console.error('Error checking setup lock:', error);
          }
        }
        
        setChecking(false);
        setConfigured(true); // Allow access to setup page
        return;
      }

      // Check if Supabase is configured
      const isConfigured = isSupabaseConfigured();
      
      if (!isConfigured) {
        // Not configured, redirect to setup
        navigate('/setup', { replace: true });
      } else {
        setConfigured(true);
      }
      
      setChecking(false);
    };

    checkSetupAccess();
  }, [navigate, location.pathname]);

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!configured && location.pathname !== '/setup') {
    return null;
  }

  return <>{children}</>;
};
