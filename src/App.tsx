import { useState } from 'react';
import { 
  Activity, Dumbbell, Compass, Share2, Trophy, Watch, 
  Utensils, Home, HeartPulse, Map, User, Sparkles, ShieldAlert,
  ChevronDown, ChevronUp, Bot
} from 'lucide-react';

// --- STATE CENTRAL (remplace le polling localStorage) ---
import { AppStateProvider, useAppState } from './context/AppStateContext';

// --- IMPORTS DES MODULES ---
import TodayTab from './components/TodayTab';
import UnifiedTriptychModule from './components/UnifiedTriptychModule';
import ClubBuddiesEcosystem from './components/ClubBuddiesEcosystem';
import SurgicalAutomationModule from './components/SurgicalAutomationModule';

import GhostPacingEngine from './components/GhostPacingEngine';
import LiveGpsTracker from './components/LiveGpsTracker';
import LiveCoachEngine from './components/LiveCoachEngine';
import GymLogTab from './components/GymLogTab';
import ExercisesTab from './components/ExercisesTab';
import { EXERCISE_REFERENCE_GUIDE } from './data/exerciseReferenceGuide';
import WodTimerTab from './components/WodTimerTab';

import SncShieldWidget from './components/SncShieldWidget';
import FitBotProactiveCoach from './components/FitBotProactiveCoach';
import BioSyncTab from './components/BioSyncTab';
import PatternRadarCard from './components/PatternRadarCard';
import CleanReadinessTab from './components/CleanReadinessTab';

import NutritionTab from './components/NutritionTab';
import FuelLockPostWod from './components/FuelLockPostWod';
import FridgeScannerTab from './components/FridgeScannerTab';
import NutritionDashboard from './components/NutritionDashboard';
import GearTrackerSection from './components/GearTrackerSection';

import ClubLeaderboard from './components/ClubLeaderboard';
import LeaderboardTab from './components/LeaderboardTab';
import RoadbookTab from './components/RoadbookTab';
import ClubPassportCard from './components/ClubPassportCard';
import SpotSegmentsTab from './components/SpotSegmentsTab';

import HybridCalendar from './components/HybridCalendar';
import ProgressTab from './components/ProgressTab';
import ProfileTab from './components/ProfileTab';

import HuaweiSyncModal from './components/HuaweiSyncModal';
import HybridShareCard from './components/HybridShareCard';
import OfflineRunGuard from './components/OfflineRunGuard';
import FitBotTab from './components/FitBotTab';

// Composant racine : ne fait qu'installer le Provider, aucune logique ici.
export default function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}

// Tout l'ancien contenu de App() vit maintenant ici, et lit la charge globale
// directement depuis le state partagé au lieu de la recalculer via polling.
function AppContent() {
  const currentUserId = "ant-boucher-id-70"; 
  const [currentView, setCurrentView] = useState<'home' | 'training' | 'health' | 'nutrition' | 'community' | 'profile'>('home');

  const [showHuaweiModal, setShowHuaweiModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFitBotModal, setShowFitBotModal] = useState(false);
  const [showAdvancedHome, setShowAdvancedHome] = useState(false);
  const [showAdvancedHealth, setShowAdvancedHealth] = useState(false);
  const [showAdvancedNutrition, setShowAdvancedNutrition] = useState(false);
  // État réel pour le Guide des Exercices (avant : exercises={[]} + setters
  // vides, donc l'onglet était en permanence vide et inutilisable).
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedExerciseCategory, setSelectedExerciseCategory] = useState('Tous');

  // Charge globale : plus de polling, plus de duplication de la formule de calcul.
  // Elle vit dans AppStateContext et se met à jour instantanément dès qu'un
  // composant (ex: UnifiedTriptychModule) modifie les sessions.
  const { trainingLoad: currentGlobalLoad, discipline, revealedModules, revealModule } = useAppState();

  // Modules de l'onglet Entraînement, filtrés par discipline. Rien n'est
  // supprimé : un module non pertinent pour la discipline choisie est juste
  // masqué par défaut, et reste accessible via "+ Ajouter un module".
  const TRAINING_MODULES: Array<{
    id: string;
    label: string;
    disciplines: Array<'musculation' | 'course' | 'crossfit'>;
    render: () => JSX.Element;
  }> = [
    { id: 'ghost-pacing', label: 'Ghost Pacing', disciplines: ['course'], render: () => <GhostPacingEngine currentVma={15} /> },
    { id: 'gps-tracker', label: 'GPS Live', disciplines: ['course'], render: () => <LiveGpsTracker onUpdateDistance={(dist) => console.log('Distance GPS:', dist)} /> },
    { id: 'live-coach', label: 'Coach Vocal', disciplines: ['course'], render: () => <LiveCoachEngine currentKm={0} currentPaceSeconds={0} isRunActive={false} /> },
    { id: 'gym-log', label: 'Carnet de Musculation', disciplines: ['musculation'], render: () => <GymLogTab currentUserId={currentUserId} /> },
    { id: 'exercises', label: 'Guide des Exercices', disciplines: ['musculation'], render: () => (
      <ExercisesTab
        exercises={EXERCISE_REFERENCE_GUIDE}
        exerciseSearch={exerciseSearch}
        setExerciseSearch={setExerciseSearch}
        selectedCategoryFilter={selectedExerciseCategory}
        setSelectedCategoryFilter={setSelectedExerciseCategory}
        onSelectExercise={() => {}}
      />
    ) },
    { id: 'wod-timer', label: 'Smart Timer WOD', disciplines: ['crossfit'], render: () => <WodTimerTab /> },
  ];

  const isModuleVisible = (mod: typeof TRAINING_MODULES[number]) =>
    discipline === 'hybride' || mod.disciplines.includes(discipline as any) || revealedModules.includes(mod.id);

  const visibleTrainingModules = TRAINING_MODULES.filter(isModuleVisible);
  const hiddenTrainingModules = TRAINING_MODULES.filter((m) => !isModuleVisible(m));

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
              onClick={() => setShowFitBotModal(true)}
              className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-600/20"
            >
              <Bot className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Coach</span>
            </button>
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

        {/* VUE D'ENSEMBLE (Home) : TodayTab en action-first, détails repliés par défaut */}
        {currentView === 'home' && (
          <div className="space-y-4 animate-fadeIn">
            <TodayTab currentUserProfile={null} onNavigateTab={setCurrentView} />

            <button
              onClick={() => setShowAdvancedHome(!showAdvancedHome)}
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-2xl text-xs font-bold text-neutral-400 hover:text-white transition cursor-pointer flex items-center justify-center gap-2"
            >
              {showAdvancedHome ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showAdvancedHome ? 'Masquer la vue avancée' : 'Voir la vue avancée (charge détaillée, automatisations, clubs)'}
            </button>

            {showAdvancedHome && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                <div className="lg:col-span-2 space-y-6">
                  <UnifiedTriptychModule currentUserId={currentUserId} />
                  <SurgicalAutomationModule />
                </div>
                <div className="space-y-6">
                  <SncShieldWidget weeklyLoad={currentGlobalLoad} />
                  <ClubBuddiesEcosystem onNavigateTab={setCurrentView} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ENTRAÎNEMENT & GPS : filtré par discipline principale */}
        {currentView === 'training' && (
          <div className="space-y-6 animate-fadeIn">
            {visibleTrainingModules.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleTrainingModules.map((mod) => (
                  <div key={mod.id}>{mod.render()}</div>
                ))}
              </div>
            )}

            {hiddenTrainingModules.length > 0 && (
              <div className="bg-neutral-900 border border-dashed border-neutral-800 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                  Modules masqués (discipline "{discipline}") — rien n'est supprimé :
                </span>
                <div className="flex flex-wrap gap-2">
                  {hiddenTrainingModules.map((mod) => (
                    <button
                      key={mod.id}
                      onClick={() => revealModule(mod.id)}
                      className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-[11px] font-bold text-neutral-300 hover:text-white transition cursor-pointer"
                    >
                      + {mod.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SANTÉ & RÉCUPÉRATION : le check-in est l'action principale, le reste
            (coach IA, bio-sync) est une analyse complémentaire repliée par défaut. */}
        {currentView === 'health' && (
          <div className="space-y-6 animate-fadeIn">
            <CleanReadinessTab />
            <SncShieldWidget weeklyLoad={currentGlobalLoad} />

            <button
              onClick={() => setShowAdvancedHealth(!showAdvancedHealth)}
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-2xl text-xs font-bold text-neutral-400 hover:text-white transition cursor-pointer flex items-center justify-center gap-2"
            >
              {showAdvancedHealth ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showAdvancedHealth ? 'Masquer les analyses avancées' : 'Voir les analyses avancées (Coach IA, Bio-Sync)'}
            </button>

            {showAdvancedHealth && (
              <div className="space-y-6 animate-fadeIn">
                <FitBotProactiveCoach />
                <BioSyncTab />
                <PatternRadarCard />
              </div>
            )}
          </div>
        )}

        {/* NUTRITION & AUTOMATISATION : le suivi du jour d'abord, les outils
            secondaires (recettes, dashboard cloud, chaussures) repliés par défaut. */}
        {currentView === 'nutrition' && (
          <div className="space-y-6 animate-fadeIn">
            <NutritionTab currentUserId={currentUserId} bodyWeight={70} />

            <button
              onClick={() => setShowAdvancedNutrition(!showAdvancedNutrition)}
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-2xl text-xs font-bold text-neutral-400 hover:text-white transition cursor-pointer flex items-center justify-center gap-2"
            >
              {showAdvancedNutrition ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showAdvancedNutrition ? 'Masquer les outils avancés' : 'Voir les outils avancés (recettes, dashboard, matériel)'}
            </button>

            {showAdvancedNutrition && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FuelLockPostWod />
                  <FridgeScannerTab />
                </div>
                <NutritionDashboard currentUserId={currentUserId} />
                <GearTrackerSection />
              </div>
            )}
          </div>
        )}

        {/* COMMUNAUTÉ & CLUBS : Mis en avant avec le Roadbook interactif en plein format */}
        {currentView === 'community' && (
          <div className="space-y-6 animate-fadeIn">
            <RoadbookTab currentUserId={currentUserId} />
            <ClubPassportCard currentUserId={currentUserId} homeClub="Club Tournai (Bastion)" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ClubLeaderboard />
              <LeaderboardTab registeredUsers={[]} />
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

      {showFitBotModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg">
            <FitBotTab
              currentUserProfile={{ username: 'Antoine Boucher' }}
              onBack={() => setShowFitBotModal(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
}
