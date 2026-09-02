import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://obtahwmcoqrcauscpksv.supabase.co';
const supabaseAnonKey = 'sb_publishable_O8CKhUtzgq9nO9lKavNE9A__fAdRWoB';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface OfflineRunGuardProps {
  currentUserId?: string;
  onSyncComplete?: () => void;
}

export default function OfflineRunGuard({ currentUserId, onSyncComplete }: OfflineRunGuardProps) {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingRunsToCloud();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    updatePendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUserId]);

  const updatePendingCount = () => {
    const savedRuns = JSON.parse(localStorage.getItem('fitpulse_offline_runs') || '[]');
    setPendingCount(savedRuns.length);
  };

  const syncPendingRunsToCloud = async () => {
    if (!currentUserId) return;
    const savedRuns = JSON.parse(localStorage.getItem('fitpulse_offline_runs') || '[]');
    
    if (savedRuns.length > 0) {
      console.log(`[Offline Sync] Restauration de ${savedRuns.length} courses hors-ligne vers Supabase...`);
      
      for (const run of savedRuns) {
        await supabase.from('offline_runs_backup').insert([{
          user_id: currentUserId,
          distance_km: run.distance,
          duration_secs: run.duration,
          synced_to_cloud: true
        }]);
      }

      localStorage.removeItem('fitpulse_offline_runs');
      setPendingCount(0);
      if (onSyncComplete) onSyncComplete();
    }
  };

  return (
    <div className={`px-4 py-2 rounded-2xl border text-xs font-bold flex items-center justify-between transition shadow-md ${
      isOnline 
        ? 'bg-neutral-950 border-neutral-800 text-neutral-400' 
        : 'bg-amber-950/40 border-amber-900/60 text-amber-400'
    }`}>
      <div className="flex items-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>Réseau Cloud Actif</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Mode Hors-Ligne (GPS Local Actif)</span>
          </>
        )}
      </div>

      {pendingCount > 0 && (
        <span className="bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-amber-500/30">
          {pendingCount} run(s) en attente de synchro
        </span>
      )}
    </div>
  );
}
