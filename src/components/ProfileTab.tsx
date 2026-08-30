import React, { useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { 
  User, ShieldCheck, MapPin, Target, Clock, Camera, Lock, Unlock, Key, LogOut, 
  Trash2, Flame, Award, Dumbbell, MessageCircle, Edit3, Check, X 
} from 'lucide-react';
import { RealUser, TransformationPhoto } from '../types';

interface ProfileTabProps {
  user: SupabaseUser | null;
  currentUserProfile?: RealUser;
  userAvatarUrl: string;
  isAdmin: boolean;
  registeredUsers: RealUser[];
  transformations: TransformationPhoto[];
  newTransWeight: number | '';
  newTransNote: string;
  newTransBefore: string | null;
  newTransAfter: string | null;
  newTransIsPrivate: boolean;
  setNewTransWeight: (val: number | '') => void;
  setNewTransNote: (val: string) => void;
  setNewTransIsPrivate: (val: boolean) => void;
  onAvatarClick: () => void;
  onCameraStart: () => void;
  onBeforeFileSelect: () => void;
  onAfterFileSelect: () => void;
  onAddTransformation: (e: React.FormEvent) => void;
  onShareTransformation: (id: string) => void;
  onUpdatePasswordSubmit: (e: React.FormEvent) => void;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  isPrivateMode: boolean;
  setIsPrivateMode: (val: boolean) => void;
  onSignOut: () => void;
  onToggleVerifyAdmin: (userId: string, currentStatus: boolean) => void;
  beforeFileInputRef: React.RefObject<HTMLInputElement>;
  afterFileInputRef: React.RefObject<HTMLInputElement>;
}

export default function ProfileTab({
  user,
  currentUserProfile,
  userAvatarUrl,
  isAdmin,
  registeredUsers,
  transformations,
  newTransWeight,
  newTransNote,
  newTransIsPrivate,
  setNewTransWeight,
  setNewTransNote,
  setNewTransIsPrivate,
  onAvatarClick,
  onBeforeFileSelect,
  onAfterFileSelect,
  onAddTransformation,
  onUpdatePasswordSubmit,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  isPrivateMode,
  setIsPrivateMode,
  onSignOut,
  onToggleVerifyAdmin,
  beforeFileInputRef,
  afterFileInputRef
}: ProfileTabProps) {
  const [activeSubSection, setActiveSubSection] = useState<'feed' | 'transformations' | 'settings'>('feed');
  const [bio, setBio] = useState(currentUserProfile?.goal || "Passionné(e) de fitness et de dépassement de soi ! 💪");
  const [isEditingBio, setIsEditingBio] = useState(false);

  return (
    <div className="space-y-4 pb-16 animate-fadeIn">
      {/* Bannière de profil style Réseau Social */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="h-36 bg-gradient-to-r from-orange-600 via-amber-600 to-neutral-900 relative">
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="px-6 pb-6 pt-0 relative flex flex-col items-center text-center -mt-14">
          <div className="relative group cursor-pointer" onClick={onAvatarClick}>
            <img 
              src={userAvatarUrl} 
              alt="Avatar" 
              className="w-24 h-24 rounded-full object-cover border-4 border-neutral-950 shadow-2xl group-hover:brightness-90 transition" 
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition text-white">
              <Camera className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <h2 className="text-lg font-black text-white flex items-center justify-center gap-1.5">
              {currentUserProfile?.username || user?.user_metadata?.username || 'Athlète FitPulse'}
              {currentUserProfile?.is_verified && <ShieldCheck className="w-5 h-5 text-orange-500 fill-orange-500/20" />}
            </h2>
            <p className="text-xs text-orange-400 font-semibold flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {currentUserProfile?.home_club || 'Club Tournai (Bastion)'}
            </p>
          </div>

          {/* Bio personnalisable */}
          <div className="mt-3 max-w-sm text-xs text-neutral-300 bg-neutral-950/60 p-3 rounded-2xl border border-neutral-800 relative group">
            <p className="italic">"{bio}"</p>
          </div>

          {/* Statistiques du profil */}
          <div className="grid grid-cols-3 gap-3 w-full mt-5">
            <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 text-center">
              <span className="block text-base font-black text-orange-500">🔥 12</span>
              <span className="text-[10px] text-neutral-400 font-semibold uppercase">Jours Streak</span>
            </div>
            <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 text-center">
              <span className="block text-base font-black text-white">💪 {transformations.length}</span>
              <span className="text-[10px] text-neutral-400 font-semibold uppercase">Évolutions</span>
            </div>
            <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 text-center">
              <span className="block text-base font-black text-orange-400">⚡ Actif</span>
              <span className="text-[10px] text-neutral-400 font-semibold uppercase">Statut</span>
            </div>
          </div>

          {/* Navigation interne du Profil */}
          <div className="flex gap-2 w-full mt-5 bg-neutral-950 p-1.5 rounded-2xl border border-neutral-800">
            <button 
              onClick={() => setActiveSubSection('feed')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${activeSubSection === 'feed' ? 'bg-orange-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}
            >
              Mes Publications 📝
            </button>
            <button 
              onClick={() => setActiveSubSection('transformations')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${activeSubSection === 'transformations' ? 'bg-orange-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}
            >
              Transformations 📸
            </button>
            <button 
              onClick={() => setActiveSubSection('settings')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${activeSubSection === 'settings' ? 'bg-orange-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}
            >
              Paramètres ⚙️
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1 : PUBLICATIONS DE L'UTILISATEUR */}
      {activeSubSection === 'feed' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-orange-500" /> Mon mur d'entraînements
          </h3>
          <div className="text-center py-10 text-neutral-500 text-xs bg-neutral-950 rounded-2xl border border-neutral-800">
            Retrouve ici toutes les séances que tu as partagées sur le fil d'actualité de ton club ! 🚀
          </div>
        </div>
      )}

      {/* SECTION 2 : TRANSFORMATIONS */}
      {activeSubSection === 'transformations' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-orange-500" /> Ajouter une photo d'évolution
            </h3>

            <form onSubmit={onAddTransformation} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={onBeforeFileSelect} className="py-3 bg-neutral-950 border border-neutral-800 hover:border-orange-500 rounded-xl text-xs font-bold text-neutral-300 flex items-center justify-center gap-2">
                  <Camera className="w-4 h-4 text-orange-500" /> Photo Avant
                </button>
                <button type="button" onClick={onAfterFileSelect} className="py-3 bg-neutral-950 border border-neutral-800 hover:border-orange-500 rounded-xl text-xs font-bold text-neutral-300 flex items-center justify-center gap-2">
                  <Camera className="w-4 h-4 text-orange-500" /> Photo Après
                </button>
                <input type="file" accept="image/*" ref={beforeFileInputRef} className="hidden" />
                <input type="file" accept="image/*" ref={afterFileInputRef} className="hidden" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Poids actuel (kg) :</label>
                <input 
                  type="number" 
                  step="0.1" 
                  placeholder="Ex: 82.5" 
                  value={newTransWeight} 
                  onChange={(e) => setNewTransWeight(e.target.value === '' ? '' : Number(e.target.value))} 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-orange-500" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Notes / Ressenti :</label>
                <input 
                  type="text" 
                  placeholder="Ex: -3kg sur le mois, belle sèche !" 
                  value={newTransNote} 
                  onChange={(e) => setNewTransNote(e.target.value)} 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-orange-500" 
                />
              </div>

              <div className="flex items-center justify-between bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="text-xs font-semibold text-neutral-300">Mode Privé (visible de toi seul)</span>
                <input 
                  type="checkbox" 
                  checked={newTransIsPrivate} 
                  onChange={(e) => setNewTransIsPrivate(e.target.checked)} 
                  className="w-4 h-4 accent-orange-600 rounded cursor-pointer" 
                />
              </div>

              <button type="submit" className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs shadow-lg transition">
                Enregistrer l'évolution 📸
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {transformations.map((t) => (
              <div key={t.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden p-3 space-y-2 shadow-lg">
                <div className="grid grid-cols-2 gap-1 h-32 rounded-xl overflow-hidden bg-neutral-950">
                  <img src={t.before_url} alt="Avant" className="w-full h-full object-cover" />
                  <img src={t.after_url} alt="Après" className="w-full h-full object-cover" />
                </div>
                <div className="text-[11px] space-y-0.5">
                  <p className="font-bold text-white">Poids : {t.weight} kg</p>
                  <p className="text-neutral-400 truncate">{t.note}</p>
                  <p className="text-[10px] text-orange-400">{t.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3 : PARAMÈTRES & SÉCURITÉ */}
      {activeSubSection === 'settings' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-orange-500" /> Modifier mon mot de passe
            </h3>

            <form onSubmit={onUpdatePasswordSubmit} className="space-y-3">
              <input 
                type="password" 
                placeholder="Nouveau mot de passe" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white" 
              />
              <input 
                type="password" 
                placeholder="Confirmer le mot de passe" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white" 
              />
              <button type="submit" className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xs transition">
                Mettre à jour le mot de passe 🔒
              </button>
            </form>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-3 shadow-xl">
            <h3 className="text-sm font-black text-white">Session & Compte</h3>
            <button onClick={onSignOut} className="w-full py-3 bg-red-950/40 border border-red-900/50 text-red-400 hover:bg-red-900/40 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" /> Se déconnecter
            </button>
          </div>

          {/* PANEL ADMINISTRATEUR */}
          {isAdmin && (
            <div className="bg-neutral-900 border border-orange-500/40 rounded-3xl p-5 space-y-4 shadow-xl">
              <h3 className="text-sm font-black text-orange-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Espace Administrateur (Gestion des Badges)
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {registeredUsers.map((u) => (
                  <div key={u.id} className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <span className="text-xs font-bold text-white block">{u.username}</span>
                        <span className="text-[10px] text-neutral-400">{u.home_club || 'Club partenaire'}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => onToggleVerifyAdmin(u.id, u.is_verified || false)} 
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${u.is_verified ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}
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
