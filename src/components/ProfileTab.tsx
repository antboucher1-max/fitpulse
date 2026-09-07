import { useState, useRef, useEffect, FormEvent, ChangeEvent, RefObject } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { 
  ShieldCheck, MapPin, Camera, Key, LogOut, 
  Dumbbell, Edit3, Check, X, Image as ImageIcon, Trophy, Share2 
} from 'lucide-react';
import { RealUser, TransformationPhoto } from '../types';
import BadgesSection from './BadgesSection';
import GearTrackerSection from './GearTrackerSection';

interface ProfileTabProps {
  user?: SupabaseUser | null;
  currentUserProfile?: RealUser;
  userAvatarUrl?: string;
  isAdmin?: boolean;
  registeredUsers?: RealUser[];
  transformations?: TransformationPhoto[];
  posts?: any[];
  shoes?: any[];
  onAddShoe?: (brand: string, model: string, maxKm: number) => void;
  onDeleteShoe?: (shoeId: string) => void;
  onSetActiveShoe?: (shoeId: string) => void;
  newTransWeight?: number | '';
  newTransNote?: string;
  newTransBefore?: string | null;
  newTransAfter?: string | null;
  newTransIsPrivate?: boolean;
  setNewTransWeight?: (val: number | '') => void;
  setNewTransNote?: (val: string) => void;
  setNewTransIsPrivate?: (val: boolean) => void;
  onAvatarClick?: () => void;
  onCameraStart?: () => void;
  onBeforeFileSelect?: () => void;
  onAfterFileSelect?: () => void;
  onAddTransformation?: (e: FormEvent) => void;
  onShareTransformation?: (id: string) => void;
  onUpdatePasswordSubmit?: (e: FormEvent) => void;
  password?: string;
  setPassword?: (val: string) => void;
  confirmPassword?: string;
  setConfirmPassword?: (val: string) => void;
  isPrivateMode?: boolean;
  setIsPrivateMode?: (val: boolean) => void;
  onSignOut?: () => void;
  onToggleVerifyAdmin?: (userId: string, currentStatus: boolean) => void;
  onUpdateProfile?: (updatedData: { username: string; home_club: string; goal: string; preferred_time: string; gender: string; avatar_url?: string; banner_url?: string; username_changes_count?: number }) => void;
  beforeFileInputRef?: RefObject<HTMLInputElement | null>;
  afterFileInputRef?: RefObject<HTMLInputElement | null>;
}

const CLUBS_LIST = [
  'Club Tournai (Bastion)', 'Club Tournai (les jeunesses)', 'Club Antoing', 'Club Péruwelz',
  'Club Leuze', 'Club Ath', 'Club Mouscron', 'Club Ronse', 'Club St-Ghislain', 'Club Mons', 'Club Jurbise'
];

const MAX_USERNAME_CHANGES = 3;

export default function ProfileTab({
  user = null,
  currentUserProfile,
  userAvatarUrl = '',
  isAdmin = false,
  registeredUsers = [],
  transformations = [],
  posts = [],
  shoes = [],
  onAddShoe = () => {},
  onDeleteShoe = () => {},
  onSetActiveShoe = () => {},
  newTransWeight = '',
  newTransNote = '',
  newTransIsPrivate = false,
  setNewTransWeight = () => {},
  setNewTransNote = () => {},
  setNewTransIsPrivate = () => {},
  onBeforeFileSelect = () => {},
  onAfterFileSelect = () => {},
  onAddTransformation = () => {},
  onUpdatePasswordSubmit = () => {},
  password = '',
  setPassword = () => {},
  confirmPassword = '',
  setConfirmPassword = () => {},
  onSignOut = () => {},
  onToggleVerifyAdmin = () => {},
  onUpdateProfile,
  beforeFileInputRef,
  afterFileInputRef
}: ProfileTabProps) {
  const [activeSubSection, setActiveSubSection] = useState<'feed' | 'transformations' | 'settings'>('feed');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // États pour les passerelles externes Strava & Garmin
  const [isStravaConnected, setIsStravaConnected] = useState(false);
  const [stravaSync, setStravaSync] = useState(true);
  const [isGarminConnected, setIsGarminConnected] = useState(false);
  const [garminSync, setGarminSync] = useState(true);

  // Interception du retour OAuth Strava dans l'URL
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');
    
    if (code) {
      setIsStravaConnected(true);
      localStorage.setItem('fitpulse_strava_connected', 'true');
      showToast('Compte Strava lié avec succès ! 🚀');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    setIsStravaConnected(localStorage.getItem('fitpulse_strava_connected') === 'true');
    setStravaSync(localStorage.getItem('fitpulse_strava_sync') !== 'false');

    setIsGarminConnected(localStorage.getItem('fitpulse_garmin_connected') === 'true');
    setGarminSync(localStorage.getItem('fitpulse_garmin_sync') !== 'false');
  }, []);

  const toggleStrava = () => {
    if (isStravaConnected) {
      setIsStravaConnected(false);
      localStorage.setItem('fitpulse_strava_connected', 'false');
      showToast('Strava déconnecté');
    } else {
      const clientId = 'TON_CLIENT_ID_STRAVA'; 
      const redirectUri = window.location.origin + window.location.pathname;
      window.location.href = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&approval_prompt=force&scope=read,activity:read_all`;
    }
  };

  const toggleGarmin = () => {
    const nextState = !isGarminConnected;
    setIsGarminConnected(nextState);
    localStorage.setItem('fitpulse_garmin_connected', String(nextState));
    showToast(nextState ? 'Garmin Connect connecté avec succès' : 'Garmin déconnecté');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [currentAvatar, setCurrentAvatar] = useState(userAvatarUrl);
  const [currentBanner, setCurrentBanner] = useState<string>(
    (currentUserProfile as any)?.banner_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200'
  );

  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const activeUsername = currentUserProfile?.username || user?.user_metadata?.username || 'Athlète';
  const changesCount = (currentUserProfile as any)?.username_changes_count || 0;
  const userPoints = (currentUserProfile as any)?.points || (currentUserProfile as any)?.points_global || 0;

  // Calcul dynamique du streak basé sur les posts ou les connexions
  const userStreak = (currentUserProfile as any)?.streak || (posts.length > 0 ? 1 : 0);

  const [editUsername, setEditUsername] = useState(activeUsername);
  const [editClub, setEditClub] = useState(currentUserProfile?.home_club || 'Club Tournai (Bastion)');
  const [editGoal, setEditGoal] = useState(currentUserProfile?.goal || 'Prise de masse / Force');
  const [editTime, setEditTime] = useState(currentUserProfile?.preferred_time || 'Soir');
  const [editGender, setEditGender] = useState(currentUserProfile?.gender || 'Homme');

  useEffect(() => {
    if (currentUserProfile?.username) {
      setEditUsername(currentUserProfile.username);
    }
  }, [currentUserProfile?.username]);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        setCurrentAvatar(res);
        if (onUpdateProfile) {
          onUpdateProfile({
            username: activeUsername,
            home_club: editClub,
            goal: editGoal,
            preferred_time: editTime,
            gender: editGender,
            avatar_url: res,
            banner_url: currentBanner,
            username_changes_count: changesCount
          });
        }
        showToast('Photo de profil mise à jour');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        setCurrentBanner(res);
        if (onUpdateProfile) {
          onUpdateProfile({
            username: activeUsername,
            home_club: editClub,
            goal: editGoal,
            preferred_time: editTime,
            gender: editGender,
            avatar_url: currentAvatar,
            banner_url: res,
            username_changes_count: changesCount
          });
        }
        showToast('Couverture mise à jour');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();

    let newChangesCount = changesCount;
    if (editUsername !== activeUsername) {
      if (changesCount >= MAX_USERNAME_CHANGES) {
        showToast('Nombre maximum de modifications atteint (3/3)');
        return;
      }
      newChangesCount += 1;
    }

    if (onUpdateProfile) {
      onUpdateProfile({
        username: editUsername,
        home_club: editClub,
        goal: editGoal,
        preferred_time: editTime,
        gender: editGender,
        avatar_url: currentAvatar,
        banner_url: currentBanner,
        username_changes_count: newChangesCount
      });
    }
    setIsEditingProfile(false);
    showToast('Profil mis à jour avec succès !');
  };

  return (
    <div className="space-y-6 pb-24 animate-fadeIn relative">
      {toastMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-neutral-900 border border-orange-500/60 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-semibold animate-fadeIn">
          <Check className="w-5 h-5 text-orange-500" /> {toastMessage}
        </div>
      )}

      <input type="file" accept="image/*" ref={avatarFileInputRef} onChange={handleAvatarChange} className="hidden" />
      <input type="file" accept="image/*" ref={bannerFileInputRef} onChange={handleBannerChange} className="hidden" />

      {/* Profil Card Modernisée */}
      <div className="bg-neutral-900 border border-neutral-800/80 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="h-44 relative group">
          <img src={currentBanner} alt="Bannière" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button 
              type="button"
              onClick={() => bannerFileInputRef.current?.click()}
              className="px-4 py-2 bg-black/80 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-2 backdrop-blur-md shadow-lg transition cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-orange-500" /> Modifier la couverture
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 relative flex flex-col items-center text-center -mt-16">
          <div className="relative group cursor-pointer" onClick={() => avatarFileInputRef.current?.click()}>
            <img src={currentAvatar} alt="Avatar" className="w-28 h-28 rounded-full object-cover border-4 border-neutral-900 shadow-2xl group-hover:brightness-90 transition" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition text-white">
              <Camera className="w-6 h-6 text-orange-500" />
            </div>
          </div>

          <div className="mt-3 space-y-1 w-full">
            <h2 className="text-xl font-black text-white flex items-center justify-center gap-2 tracking-tight">
              {activeUsername}
              {currentUserProfile?.is_verified && <ShieldCheck className="w-5 h-5 text-orange-500 fill-orange-500/20" />}
            </h2>
            <p className="text-xs text-orange-400 font-bold flex items-center justify-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> {currentUserProfile?.home_club || 'Club Tournai (Bastion)'}
            </p>
          </div>

          <button 
            type="button"
            onClick={() => setIsEditingProfile(true)}
            className="mt-4 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 transition shadow-md cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-orange-500" /> Modifier le profil
          </button>

          <div className="grid grid-cols-2 gap-3 w-full mt-5">
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80 text-left">
              <span className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wider">Objectif</span>
              <span className="text-xs font-black text-white truncate block mt-1">{currentUserProfile?.goal || 'Musculation'}</span>
            </div>
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80 text-left">
              <span className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wider">Disponibilité</span>
              <span className="text-xs font-black text-white truncate block mt-1">{currentUserProfile?.preferred_time || 'Soir'}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full mt-3">
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80 text-center">
              <span className="block text-lg font-black text-orange-500">🔥 {userStreak}</span>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Streak</span>
            </div>
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80 text-center">
              <span className="block text-lg font-black text-white">💪 {transformations.length}</span>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Évolutions</span>
            </div>
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80 text-center">
              <span className="block text-lg font-black text-orange-400">🏆 {userPoints}</span>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Points Ligue</span>
            </div>
          </div>

          <div className="w-full mt-4 space-y-4">
            <BadgesSection userPosts={posts} userProfile={currentUserProfile} />
            <GearTrackerSection shoes={shoes} onAddShoe={onAddShoe} onDeleteShoe={onDeleteShoe} onSetActiveShoe={onSetActiveShoe} />
          </div>

          <div className="flex gap-2 w-full mt-6 bg-neutral-950 p-1.5 rounded-2xl border border-neutral-800">
            <button 
              type="button"
              onClick={() => setActiveSubSection('feed')}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${activeSubSection === 'feed' ? 'bg-orange-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}
            >
              Publications
            </button>
            <button 
              type="button"
              onClick={() => setActiveSubSection('transformations')}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${activeSubSection === 'transformations' ? 'bg-orange-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}
            >
              Transformations
            </button>
            <button 
              type="button"
              onClick={() => setActiveSubSection('settings')}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${activeSubSection === 'settings' ? 'bg-orange-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}
            >
              Paramètres
            </button>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-orange-500" /> Modifier mon profil
              </h3>
              <button type="button" onClick={() => setIsEditingProfile(false)} className="p-2 text-neutral-400 hover:text-white rounded-xl cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-neutral-400">Pseudo :</label>
                  <span className="text-[10px] text-orange-400 font-bold">
                    Modifs : {changesCount} / {MAX_USERNAME_CHANGES} max
                  </span>
                </div>
                <input 
                  type="text" 
                  value={editUsername} 
                  onChange={(e) => setEditUsername(e.target.value)} 
                  disabled={changesCount >= MAX_USERNAME_CHANGES && editUsername === activeUsername}
                  className={`w-full bg-neutral-950 border rounded-2xl px-4 py-3 text-xs text-white focus:border-orange-500 focus:outline-none ${changesCount >= MAX_USERNAME_CHANGES ? 'opacity-60 cursor-not-allowed border-red-900/50' : 'border-neutral-800'}`} 
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1">Club Principal :</label>
                <select 
                  value={editClub} 
                  onChange={(e) => setEditClub(e.target.value)} 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:border-orange-500 focus:outline-none cursor-pointer"
                >
                  {CLUBS_LIST.map((club) => (
                    <option key={club} value={club}>{club}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1">Objectif principal :</label>
                <input 
                  type="text" 
                  value={editGoal} 
                  onChange={(e) => setEditGoal(e.target.value)} 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:border-orange-500 focus:outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 mb-1">Disponibilité :</label>
                  <select 
                    value={editTime} 
                    onChange={(e) => setEditTime(e.target.value)} 
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-3 py-3 text-xs text-white focus:border-orange-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Matin">Matin</option>
                    <option value="Midi">Midi</option>
                    <option value="Soir">Soir</option>
                    <option value="Week-end">Week-end</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 mb-1">Genre :</label>
                  <select 
                    value={editGender} 
                    onChange={(e) => setEditGender(e.target.value)} 
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-3 py-3 text-xs text-white focus:border-orange-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl text-xs shadow-xl transition cursor-pointer">
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FEED SUB-SECTION */}
      {activeSubSection === 'feed' && (
        <div className="bg-neutral-900 border border-neutral-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-wider">
            <Dumbbell className="w-4 h-4 text-orange-500" /> Mes publications
          </h3>
          <div className="text-center py-12 text-neutral-400 text-xs bg-neutral-950 rounded-2xl border border-neutral-800">
            Retrouve ici toutes les séances que tu as partagées sur le fil d'actualité !
          </div>
        </div>
      )}

      {/* TRANSFORMATIONS SUB-SECTION */}
      {activeSubSection === 'transformations' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-wider">
              <Camera className="w-4 h-4 text-orange-500" /> Ajouter une évolution
            </h3>

            <form onSubmit={onAddTransformation} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={onBeforeFileSelect} className="py-3.5 bg-neutral-950 border border-neutral-800 hover:border-orange-500 rounded-2xl text-xs font-bold text-neutral-200 flex items-center justify-center gap-2 cursor-pointer transition">
                  <Camera className="w-4 h-4 text-orange-500" /> Photo Avant
                </button>
                <button type="button" onClick={onAfterFileSelect} className="py-3.5 bg-neutral-950 border border-neutral-800 hover:border-orange-500 rounded-2xl text-xs font-bold text-neutral-200 flex items-center justify-center gap-2 cursor-pointer transition">
                  <Camera className="w-4 h-4 text-orange-500" /> Photo Après
                </button>
                <input type="file" accept="image/*" ref={beforeFileInputRef} className="hidden" />
                <input type="file" accept="image/*" ref={afterFileInputRef} className="hidden" />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1">Poids actuel (kg) :</label>
                <input 
                  type="number" 
                  step="0.1" 
                  placeholder="Ex: 82.5" 
                  value={newTransWeight} 
                  onChange={(e) => setNewTransWeight(e.target.value === '' ? '' : Number(e.target.value))} 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:border-orange-500 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1">Notes / Ressenti :</label>
                <input 
                  type="text" 
                  placeholder="Ex: -3kg sur le mois" 
                  value={newTransNote} 
                  onChange={(e) => setNewTransNote(e.target.value)} 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:border-orange-500 focus:outline-none" 
                />
              </div>

              <div className="flex items-center justify-between bg-neutral-950 px-4 py-3 rounded-2xl border border-neutral-800">
                <span className="text-xs font-bold text-neutral-300">Mode Privé</span>
                <input 
                  type="checkbox" 
                  checked={newTransIsPrivate} 
                  onChange={(e) => setNewTransIsPrivate(e.target.checked)} 
                  className="w-4 h-4 accent-orange-600 rounded cursor-pointer" 
                />
              </div>

              <button type="submit" onClick={() => showToast('Évolution enregistrée !')} className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl text-xs shadow-lg transition cursor-pointer">
                Enregistrer l'évolution
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {transformations.map((t) => (
              <div key={t.id} className="bg-neutral-900 border border-neutral-800/80 rounded-3xl overflow-hidden p-4 space-y-3 shadow-lg">
                <div className="grid grid-cols-2 gap-2 h-36 rounded-2xl overflow-hidden bg-neutral-950">
                  <img src={t.before_url} alt="Avant" className="w-full h-full object-cover" />
                  <img src={t.after_url} alt="Après" className="w-full h-full object-cover" />
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-black text-white">Poids : {t.weight} kg</p>
                  <p className="text-neutral-400 truncate text-[11px]">{t.note}</p>
                  <p className="text-[10px] text-orange-400 font-bold">{t.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SETTINGS SUB-SECTION */}
      {activeSubSection === 'settings' && (
        <div className="space-y-4">
          {/* Passerelle GPS / Plateformes Externes */}
          <div className="bg-neutral-900 border border-neutral-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-widest">
                <Share2 className="w-4 h-4" /> Passerelles GPS & Plateformes
              </div>
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950 px-3 py-1 rounded-full border border-neutral-800">
                API Sync
              </span>
            </div>

            {/* Bloc Strava */}
            <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-600/20 text-orange-500 flex items-center justify-center font-black text-xs">
                    S
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Strava</h4>
                    <p className="text-[10px] text-neutral-400">Synchronisation des runs & segments</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleStrava}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    isStravaConnected
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-orange-600 border-orange-500 text-white hover:bg-orange-500'
                  }`}
                >
                  {isStravaConnected ? 'Connecté ✓' : 'Connecter'}
                </button>
              </div>

              {isStravaConnected && (
                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <span className="text-neutral-300">Envoyer mes runs automatiquement sur Strava</span>
                  <input
                    type="checkbox"
                    checked={stravaSync}
                    onChange={(e) => {
                      setStravaSync(e.target.checked);
                      localStorage.setItem('fitpulse_strava_sync', String(e.target.checked));
                    }}
                    className="w-4 h-4 rounded accent-orange-500 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Bloc Garmin */}
            <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-black text-xs">
                    G
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Garmin Connect</h4>
                    <p className="text-[10px] text-neutral-400">Import/Export de charges & montres GPS</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleGarmin}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    isGarminConnected
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-cyan-600 border-cyan-500 text-white hover:bg-cyan-500'
                  }`}
                >
                  {isGarminConnected ? 'Connecté ✓' : 'Connecter'}
                </button>
              </div>

              {isGarminConnected && (
                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <span className="text-neutral-300">Envoyer mes runs automatiquement sur Garmin</span>
                  <input
                    type="checkbox"
                    checked={garminSync}
                    onChange={(e) => {
                      setGarminSync(e.target.checked);
                      localStorage.setItem('fitpulse_garmin_sync', String(e.target.checked));
                    }}
                    className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-xs text-white uppercase tracking-wider">Barème des Points de la Ligue</h3>
                <p className="text-[11px] text-neutral-400">Fais gagner ton club et grimpe dans ta catégorie !</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800/80">
                <span className="text-neutral-300 font-bold">🔥 Battre un record (PR)</span>
                <span className="font-black text-orange-400 bg-orange-500/10 px-3 py-1 rounded-xl">+25 pts</span>
              </div>
              <div className="flex items-center justify-between bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800/80">
                <span className="text-neutral-300 font-bold">🏋️ Partager une séance</span>
                <span className="font-black text-orange-400 bg-orange-500/10 px-3 py-1 rounded-xl">+10 pts</span>
              </div>
              <div className="flex items-center justify-between bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800/80">
                <span className="text-neutral-300 font-bold">📸 Publier une Story</span>
                <span className="font-black text-orange-400 bg-orange-500/10 px-3 py-1 rounded-xl">+5 pts</span>
              </div>
              <div className="flex items-center justify-between bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800/80">
                <span className="text-neutral-300 font-bold">⚡ Série (Streak journalier)</span>
                <span className="font-black text-orange-400 bg-orange-500/10 px-3 py-1 rounded-xl">+2 pts / jour</span>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-wider">
              <Key className="w-4 h-4 text-orange-500" /> Sécurité du mot de passe
            </h3>

            <form onSubmit={(e) => { e.preventDefault(); showToast('Mot de passe mis à jour !'); onUpdatePasswordSubmit(e); }} className="space-y-3">
              <input 
                type="password" 
                placeholder="Nouveau mot de passe" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none" 
              />
              <input 
                type="password" 
                placeholder="Confirmer le mot de passe" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none" 
              />
              <button type="submit" className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-2xl text-xs transition cursor-pointer">
                Mettre à jour le mot de passe
              </button>
            </form>
          </div>

          <div className="bg-neutral-900 border border-neutral-800/80 rounded-3xl p-6 space-y-3 shadow-xl">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Session</h3>
            <button 
              type="button"
              onClick={async () => {
                await onSignOut();
              }} 
              className="w-full py-3.5 bg-red-950/40 border border-red-900/50 text-red-400 hover:bg-red-900/40 font-bold rounded-2xl text-xs transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-lg"
            >
              <LogOut className="w-4 h-4" /> Se déconnecter
            </button>
          </div>

          {isAdmin && (
            <div className="bg-neutral-900 border border-orange-500/40 rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-black text-orange-400 flex items-center gap-2 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" /> Espace Administrateur
              </h3>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {registeredUsers.map((u) => (
                  <div key={u.id} className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar_url} alt="" className="w-9 h-9 rounded-xl object-cover" />
                      <div>
                        <span className="text-xs font-black text-white block">{u.username}</span>
                        <span className="text-[10px] text-neutral-400 font-medium">{u.home_club || 'Club'}</span>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => { onToggleVerifyAdmin(u.id, u.is_verified || false); showToast('Badge mis à jour'); }} 
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${u.is_verified ? 'bg-orange-600 text-white shadow-lg' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
                    >
                      {u.is_verified ? 'Certifié ✓' : 'Certifier'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
