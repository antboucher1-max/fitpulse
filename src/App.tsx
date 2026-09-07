import { useState, useEffect } from 'react';
import { 
  Activity, Dumbbell, Compass, Share2, Trophy, Watch, 
  Utensils, Home, HeartPulse, Map, User, Sparkles, ShieldAlert 
} from 'lucide-react';

// --- IMPORTS DES MODULES ---
import UnifiedTriptychModule from './components/UnifiedTriptychModule';
import FitBotSncShield from './components/FitBotSncShield';
import ClubBuddiesEcosystem from './components/ClubBuddiesEcosystem';
import SurgicalAutomationModule from './components/SurgicalAutomationModule';

import GhostPacingEngine from './components/GhostPacingEngine';
import LiveGpsTracker from './components/LiveGpsTracker';
import LiveCoachEngine from './components/LiveCoachEngine';
import GymLogTab from './components/GymLogTab';
import ExercisesTab from './components/ExercisesTab';
import WodTimerTab from './components/WodTimerTab';

import SncShieldWidget from './components/SncShieldWidget';
import ReadinessCheckin from './components/ReadinessCheckin';
import FitBotProactiveCoach from './components/FitBotProactiveCoach';
import BioSyncTab from './components/BioSyncTab';
import CleanReadinessTab from './components/CleanReadinessTab';

import NutritionTab from './components/NutritionTab';
import FuelLockPostWod from './components/FuelLockPostWod';
import FridgeScannerTab from './components/FridgeScannerTab';
import NutritionDashboard from './components/NutritionDashboard';
import GearTrackerSection from './components/GearTrackerSection';

import ClubLeaderboard from './components/ClubLeaderboard';
import LeaderboardTab from './components/LeaderboardTab';
import RoadbookTab from './components/RoadbookTab';
import SpotSegmentsTab from './components/SpotSegmentsTab';

import HybridCalendar from './components/HybridCalendar';
import ProgressTab from './components/ProgressTab';
import ProfileTab from './components/ProfileTab';

import HuaweiSyncModal from './components/HuaweiSyncModal';
import HybridShareCard from './components/HybridShareCard';
import OfflineRunGuard from './components/OfflineRunGuard';

export default function App() {
  const currentUserId = "ant-boucher-id-70"; 
  const [currentView, setCurrentView] = useState<'home' | 'training' | 'health' | 'nutrition' | 'community' | 'profile'>('home');

  const [showHuaweiModal, setShowHuaweiModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // État partagé pour synchroniser la charge globale en temps réel avec le SNC Shield
  const [currentGlobalLoad, setCurrentGlobalLoad] = useState<number>(() => {
    const saved = localStorage.getItem('fitpulse_triptych_sessions');
    if (saved) {
      try {
        const sessions = JSON.parse(saved);
        let totalLoad = 0;
        sessions.forEach((session: any) => {
          let multiplier = 1.0;
          if (session.type === 'run') multiplier = 1.2;
          if (session.type === 'gym') multiplier = 1.0;
          if (session.type === 'fitcross') multiplier = 1.4;
          totalLoad += (session.durationMins || 0) * (session.rpe || 0) * multiplier;
        });
        return Math.round(totalLoad);
      } catch (e) {
        // ignore
      }
    }
    return 1483;
  });

  // Écouteur pour mettre à jour la charge globale instantanément lors des modifications du triptyque
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('fitpulse_triptych_sessions');
      if (saved) {
        try {
          const sessions = JSON.parse(saved);
          let totalLoad = 0;
          sessions.forEach((session: any) => {
            let multiplier = 1.0;
            if (session.type === 'run') multiplier = 1.2;
            if (session.type === 'gym') multiplier = 1.0;
            if (session.type === 'fitcross') multiplier = 1.4;
            totalLoad += (session.durationMins || 0) * (session.rpe || 0) * multiplier;
          });
          setCurrentGlobalLoad(Math.round(totalLoad));
        } catch (e) {
          // ignore
        }
      } else {
        setCurrentGlobalLoad(0);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Intervalle court pour intercepter les modifications locales instantanément
    const interval = setInterval(handleStorageChange, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white pb-32 selection:bg-orange-500 selection:text-white font-sans antialiased">
      
      {/* Barre de sécurité Cloud/Offline discrète */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <OfflineRunGuard currentUserId={currentUserId} />
      </div>

      {/* En-tête Pro SaaS */}
      <header className="max-w-5xl mx-auto px-4 py-5 space-y-4 border-b border-neutral-900/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-black shadow-lg shadow-orange-600/20 text-lg">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-white uppercase">FitPulse OS</h1>
                <span className="text-[9px] bg-orange-500/10 text-orange-400 font-extrabold px-2 py-0.5 rounded-full border border-orange-500/20">PRO</span>
              </div>
              <p className="text-[11px] text-neutral-400">Plateforme Hybride & Clubs Indépendants</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowHuaweiModal(true)}
              className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800/80 rounded-xl text-xs font-bold text-neutral-300 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Watch className="w-3.5 h-3.5 text-red-400" /> <span className="hidden sm:inline">Huawei</span>
            </button>
            <button 
              onClick={() => setShowShareModal(true)}
              className="px-3 py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-orange-600/20"
            >
              <Share2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Apex Card</span>
            </button>
          </div>
        </div>

        {/* Navigation Principale Épurée */}
        <nav className="flex gap-1.5 overflow-x-auto pt-1 pb-1 scrollbar-none">
          {[
            { id: 'home', label: 'Vue d’ensemble', icon: Home },
            { id: 'training', label: 'Entraînement', icon: Dumbbell },
            { id: 'health', label: 'Santé & SNC', icon: HeartPulse },
            { id: 'nutrition', label: 'Nutrition Lab', icon: Utensils },
            { id: 'community', label: 'Clubs & Ligue', icon: Map },
            { id: 'profile', label: 'Profil & Stats', icon: User },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = currentView === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setCurrentView(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 border ${
                  isActive 
                    ? 'bg-neutral-900 border-orange-500/50 text-white shadow-md shadow-orange-500/5' 
                    : 'bg-neutral-950 border-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-500' : 'text-neutral-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* --- CONTENU PRINCIPAL --- */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* VUE D'ENSEMBLE (Home) : Vitrine stratosphérique */}
        {currentView === 'home' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <UnifiedTriptychModule currentUserId={currentUserId} />
                <SurgicalAutomationModule />
              </div>
              <div className="space-y-6">
                <SncShieldWidget weeklyLoad={currentGlobalLoad} />
                <ClubBuddiesEcosystem />
              </div>
            </div>
          </div>
        )}

        {/* ENTRAÎNEMENT & GPS */}
        {currentView === 'training' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GhostPacingEngine currentVma={15} />
              <LiveGpsTracker onUpdateDistance={(dist) => console.log('Distance GPS:', dist)} />
            </div>
            <LiveCoachEngine currentKm={5} currentPaceSeconds={300} isRunActive={true} />
            <GymLogTab currentUserId={currentUserId} />
            <ExercisesTab exercises={[]} exerciseSearch="" setExerciseSearch={() => {}} selectedCategoryFilter="Tous" setSelectedCategoryFilter={() => {}} onSelectExercise={() => {}} />
            <WodTimerTab />
          </div>
        )}

        {/* SANTÉ & RÉCUPÉRATION */}
        {currentView === 'health' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SncShieldWidget weeklyLoad={currentGlobalLoad} />
              <ReadinessCheckin />
            </div>
            <FitBotProactiveCoach />
            <BioSyncTab />
            <CleanReadinessTab />
          </div>
        )}

        {/* NUTRITION & AUTOMATISATION */}
        {currentView === 'nutrition' && (
          <div className="space-y-6 animate-fadeIn">
            <NutritionTab currentUserId={currentUserId} bodyWeight={70} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FuelLockPostWod />
              <FridgeScannerTab />
            </div>
            <NutritionDashboard currentUserId={currentUserId} />
            <GearTrackerSection />
          </div>
        )}

        {/* COMMUNAUTÉ & CLUBS */}
        {currentView === 'community' && (
          <div className="space-y-6 animate-fadeIn">
            <ClubLeaderboard />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LeaderboardTab registeredUsers={[]} />
              <RoadbookTab currentUserId={currentUserId} />
            </div>
            <SpotSegmentsTab />
          </div>
        )}

        {/* PROFIL, CALENDRIER & STATS */}
        {currentView === 'profile' && (
          <div className="space-y-6 animate-fadeIn">
            <ProfileTab />
            <HybridCalendar posts={[]} currentUserId={currentUserId} />
            <ProgressTab posts={[]} />
          </div>
        )}

      </main>

      {/* MODALES GLOBALES */}
      {showHuaweiModal && (
        <HuaweiSyncModal 
          currentUserId={currentUserId} 
          onClose={() => setShowHuaweiModal(false)} 
          onSynced={() => {}} 
        />
      )}

      {showShareModal && (
        <HybridShareCard 
          username="Antoine Boucher" 
          runKm={12.5} 
          runTime="52:10" 
          squatKg={130} 
          wodName="FRAN" 
          wodScore="3:55" 
          onClose={() => setShowShareModal(false)} 
        />
      )}

    </div>
  );
}
