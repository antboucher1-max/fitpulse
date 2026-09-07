import { useState } from 'react';
import { 
  Activity, Dumbbell, Compass, Footprints, Calendar, 
  Share2, Trophy, Zap, Watch, ShieldAlert, Utensils, Home, HeartPulse, Map, User, BookOpen 
} from 'lucide-react';

// --- 1. IMPORT DES MOTEURS & PILIER STRATÉGIQUES ---
import UnifiedTriptychModule from './components/UnifiedTriptychModule';
import FitBotSncShield from './components/FitBotSncShield';
import ClubBuddiesEcosystem from './components/ClubBuddiesEcosystem';
import SurgicalAutomationModule from './components/SurgicalAutomationModule';

// --- 2. IMPORT DES ONGLETS D'ENTRAÎNEMENT & COURSE ---
import RunningTab from './components/RunningTab';
import GymLogTab from './components/GymLogTab';
import ExercisesTab from './components/ExercisesTab';
import TrainingPlanTab from './components/TrainingPlanTab';
import WodTimerTab from './components/WodTimerTab';
import FloatingWodTimer from './components/FloatingWodTimer';
import GhostPacingEngine from './components/GhostPacingEngine';
import LiveGpsTracker from './components/LiveGpsTracker';
import LiveCoachEngine from './components/LiveCoachEngine';
import LiveTrackerTab from './components/LiveTrackerTab';

// --- 3. IMPORT DE LA SANTÉ & RÉCUPÉRATION (FITBOT / SNC) ---
import BioSyncTab from './components/BioSyncTab';
import CleanReadinessTab from './components/CleanReadinessTab';
import ReadinessTab from './components/ReadinessTab';
import ReadinessCheckin from './components/ReadinessCheckin';
import FitBotTab from './components/FitBotTab';
import FitBotProactiveCoach from './components/FitBotProactiveCoach';
import SncShieldWidget from './components/SncShieldWidget';

// --- 4. IMPORT DE LA NUTRITION & AUTOMATISATION ---
import NutritionTab from './components/NutritionTab';
import NutritionDashboard from './components/NutritionDashboard';
import NutritionPlannerTab from './components/NutritionPlannerTab';
import FridgeScannerTab from './components/FridgeScannerTab';
import FuelLockPostWod from './components/FuelLockPostWod';
import GearTrackerSection from './components/GearTrackerSection';
import EquipmentTab from './components/EquipmentTab';

// --- 5. IMPORT DE LA COMMUNAUTÉ, CLUBS & ROADBOOKS ---
import ClubLeaderboard from './components/ClubLeaderboard';
import LeaderboardTab from './components/LeaderboardTab';
import BuddyTab from './components/BuddyTab';
import ChatTab from './components/ChatTab';
import RoadbookTab from './components/RoadbookTab';
import SpotSegmentsTab from './components/SpotSegmentsTab';
import GeolocSpotFilter from './components/GeolocSpotFilter';

// --- 6. IMPORT DU PROFIL, HISTORIQUE & OUTILS ---
import TodayTab from './components/TodayTab';
import FeedTab from './components/FeedTab';
import FeedHistoryTab from './components/FeedHistoryTab';
import ProgressTab from './components/ProgressTab';
import PerformanceChartTab from './components/PerformanceChartTab';
import HybridCalendar from './components/HybridCalendar';
import ProfileTab from './components/ProfileTab';
import UserProfilePage from './components/UserProfilePage';
import HuaweiSyncModal from './components/HuaweiSyncModal';
import HybridShareCard from './components/HybridShareCard';
import OfflineRunGuard from './components/OfflineRunGuard';
import OnboardingWizard from './components/OnboardingWizard';
import PaywallGate from './components/PaywallGate';

export default function App() {
  const currentUserId = "ant-boucher-id-70"; 
  const [currentView, setCurrentView] = useState<'home' | 'training' | 'health' | 'nutrition' | 'community' | 'profile'>('home');

  // Modales globales
  const [showHuaweiModal, setShowHuaweiModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-950 text-white pb-28 selection:bg-orange-500 selection:text-white">
      
      {/* Barre de sécurité Hors-Ligne / Cloud */}
      <div className="max-w-5xl mx-auto p-4">
        <OfflineRunGuard currentUserId={currentUserId} />
      </div>

      {/* En-tête Principal FitPulse OS */}
      <header className="max-w-5xl mx-auto px-4 py-6 space-y-4 border-b border-neutral-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 text-white flex items-center justify-center font-black shadow-lg shadow-orange-600/30 text-xl">
              ⚡
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white uppercase">FitPulse OS</h1>
              <p className="text-xs text-neutral-400">Système d'exploitation pour Athlète Hybride & Clubs Indépendants</p>
            </div>
          </div>

          {/* Actions rapides globales */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowHuaweiModal(true)}
              className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-300 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Watch className="w-4 h-4 text-red-400" /> <span className="hidden sm:inline">Huawei Sync</span>
            </button>
            <button 
              onClick={() => setShowShareModal(true)}
              className="px-3 py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-orange-600/20"
            >
              <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">Carte Apex</span>
            </button>
          </div>
        </div>

        {/* Barre de Navigation Principale par Pôles */}
        <nav className="flex gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
          <button 
            onClick={() => setCurrentView('home')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${currentView === 'home' ? 'bg-orange-600 text-white shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}
          >
            <Home className="w-4 h-4" /> ⚡ Vue d'ensemble (4 Piliers)
          </button>
          <button 
            onClick={() => setCurrentView('training')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${currentView === 'training' ? 'bg-orange-600 text-white shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}
          >
            <Dumbbell className="w-4 h-4" /> 🏋️‍♂️ Entraînement & GPS
          </button>
          <button 
            onClick={() => setCurrentView('health')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${currentView === 'health' ? 'bg-orange-600 text-white shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}
          >
            <HeartPulse className="w-4 h-4" /> 🛡️ FitBot & Santé SNC
          </button>
          <button 
            onClick={() => setCurrentView('nutrition')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${currentView === 'nutrition' ? 'bg-orange-600 text-white shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}
          >
            <Utensils className="w-4 h-4" /> 🍏 Nutrition Lab & Frigo
          </button>
          <button 
            onClick={() => setCurrentView('community')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${currentView === 'community' ? 'bg-orange-600 text-white shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}
          >
            <Map className="w-4 h-4" /> 🏛️ Clubs & Roadbooks
          </button>
          <button 
            onClick={() => setCurrentView('profile')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${currentView === 'profile' ? 'bg-orange-600 text-white shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}
          >
            <User className="w-4 h-4" /> ⚙️ Profil & Calendrier
          </button>
        </nav>
      </header>

      {/* --- AFFICHAGE DES MODULES SELON LE PÔLE SÉLECTIONNÉ --- */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* PÔLE 1 : VUE D'ENSEMBLE (Les 4 Piliers Stratégiques) */}
        {currentView === 'home' && (
          <div className="space-y-6 animate-fadeIn">
            <UnifiedTriptychModule currentUserId={currentUserId} />
            <FitBotSncShield />
            <ClubBuddiesEcosystem />
            <SurgicalAutomationModule />
          </div>
        )}

        {/* PÔLE 2 : ENTRAÎNEMENT (Muscu, Course, GPS, Timers) */}
        {currentView === 'training' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GhostPacingEngine currentVma={15} />
              <LiveGpsTracker onUpdateDistance={(dist) => console.log('Distance GPS:', dist)} />
            </div>
            <LiveCoachEngine currentKm={5} currentPaceSeconds={300} isRunActive={true} />
            <GymLogTab currentUserId={currentUserId} />
            <ExercisesTab />
            <WodTimerTab />
          </div>
        )}

        {/* PÔLE 3 : SANTÉ & RÉCUPÉRATION (FitBot & SNC) */}
        {currentView === 'health' && (
          <div className="space-y-6 animate-fadeIn">
            <SncShieldWidget />
            <ReadinessCheckin />
            <FitBotProactiveCoach />
            <BioSyncTab />
            <CleanReadinessTab />
          </div>
        )}

        {/* PÔLE 4 : NUTRITION & AUTOMATISATION */}
        {currentView === 'nutrition' && (
          <div className="space-y-6 animate-fadeIn">
            <NutritionTab currentUserId={currentUserId} bodyWeight={70} />
            <FuelLockPostWod />
            <FridgeScannerTab />
            <NutritionDashboard currentUserId={currentUserId} />
            <GearTrackerSection />
          </div>
        )}

        {/* PÔLE 5 : COMMUNAUTÉ, CLUBS & ROADBOOKS */}
        {currentView === 'community' && (
          <div className="space-y-6 animate-fadeIn">
            <ClubLeaderboard />
            <LeaderboardTab registeredUsers={[]} />
            <RoadbookTab />
            <SpotSegmentsTab />
          </div>
        )}

        {/* PÔLE 6 : PROFIL, CALENDRIER & HISTORIQUE */}
        {currentView === 'profile' && (
          <div className="space-y-6 animate-fadeIn">
            <HybridCalendar posts={[]} currentUserId={currentUserId} />
            <ProgressTab />
            <ProfileTab />
          </div>
        )}

      </main>

      {/* Modales Globales */}
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
