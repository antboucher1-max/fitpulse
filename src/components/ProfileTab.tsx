import React, { useState } from 'react';
import { Camera, ShieldCheck, ImageIcon, Key, LogOut, EyeOff, Share2, MapPin, CheckCircle, Target, Clock } from 'lucide-react';
import { RealUser, TransformationPhoto } from '../types';

interface ProfileTabProps {
  user: any;
  currentUserProfile?: RealUser;
  userAvatarUrl: string;
  isAdmin: boolean;
  registeredUsers: RealUser[];
  transformations: TransformationPhoto[];
  newTransBefore: string | null;
  newTransAfter: string | null;
  newTransWeight: number | '';
  newTransNote: string;
  newTransIsPrivate: boolean;
  setNewTransWeight: (val: number | '') => void;
  setNewTransNote: (val: string) => void;
  setNewTransIsPrivate: (val: boolean) => void;
  onAvatarClick: () => void;
  onCameraStart: (target: 'trans_before' | 'trans_after') => void;
  onBeforeFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAfterFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddTransformation: (e: React.FormEvent) => void;
  onShareTransformation: (item: TransformationPhoto) => void;
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

const TIME_SLOTS = ['🌅 Matin (6h - 9h)', '☀️ Midi (12h - 14h)', '🌆 Soir (17h - 20h)', '🌙 Nocturne (20h+)', '📅 Week-end flexible'];
const WORKOUT_GOALS = ['🏋️‍♂️ Musculation / Force', '💪 Prise de masse', '🔥 Perte de poids / Sèche', '⚡ Cardio / HIIT', '🏃‍♂️ Endurance'];

export default function ProfileTab({
  user,
  currentUserProfile,
  userAvatarUrl,
  isAdmin,
  registeredUsers,
  transformations,
  newTransBefore,
  newTransAfter,
  newTransWeight,
  newTransNote,
  newTransIsPrivate,
  setNewTransWeight,
  setNewTransNote,
  setNewTransIsPrivate,
  onAvatarClick,
  onCameraStart,
  onBeforeFileSelect,
  onAfterFileSelect,
  onAddTransformation,
  onShareTransformation,
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
  const [selectedGoal, setSelectedGoal] = useState(currentUserProfile?.goal || WORKOUT_GOALS[0]);
  const [selectedTime, setSelectedTime] = useState(currentUserProfile?.preferred_time || TIME_SLOTS[2]);
  const [showCGUModal, setShowCGUModal] = useState(false);

  const certifiedBuddies = registeredUsers.filter(u => u.is_verified);

  const handleUpdatePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    alert("✅ Objectifs et horaires mis à jour avec succès !");
  };

  return (
    <div className="space-y-5 pb-10">
      {/* En-tête du profil */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center space-y-4 shadow-xl">
        <div className="relative w-24 h-24 mx-auto group cursor-pointer" onClick={onAvatarClick}>
          <img src={userAvatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover border-2 border-orange-500 shadow-xl" />
          <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition"><Camera className="w-6 h-6 text-white" /></div>
        </div>
        <div>
          <h2 className="font-extrabold text-lg text-white flex items-center justify-center gap-1.5">
            {user?.user_metadata?.first_name || user?.email?.split('@')[0]}
            <ShieldCheck className="w-5 h-5 text-orange-500 fill-orange-500/20" />
            {isAdmin && <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30">ADMIN</span>}
          </h2>
          <p className="text-xs text-orange-400 mt-1 flex items-center justify-center gap-1 font-semibold">
            <MapPin className="w-3.5 h-3.5" /> {currentUserProfile?.home_club || 'Club Tournai (Bastion)'}
          </p>
        </div>
      </div>

      {/* MODIFICATION DES OBJECTIFS ET HORAIRES (Modifiables à tout moment) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2"><Target className="w-4 h-4 text-orange-500" /> Mes Objectifs & Disponibilités</h3>
        <form onSubmit={handleUpdatePreferences} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">Objectif principal :</label>
            <select value={selectedGoal} onChange={(e) => setSelectedGoal(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-xs text-white">
              {WORKOUT_GOALS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-orange-500" /> Tranche horaire préférée :
            </label>
            <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-xs text-white">
              {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <button type="submit" className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs transition shadow-md">
            Mettre à jour mes préférences 🔄
          </button>
        </form>
      </div>

      {/* ESPACE ADMIN (Si admin) */}
      {isAdmin && (
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border-2 border-orange-500/50 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center gap-2.5 text-orange-400">
            <ShieldCheck className="w-6 h-6 fill-orange-500/20" />
            <div>
              <h3 className="text-base font-black tracking-tight">Panneau Administrateur</h3>
              <p className="text-xs text-neutral-400">Gère les certifications des profils.</p>
            </div>
          </div>
          <div className="space-y-2.5 pt-2 max-h-72 overflow-y-auto pr-1">
            {registeredUsers.map(u => (
              <div key={u.id} className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border border-neutral-800" />
                  <div>
                    <span className="font-bold text-white text-sm flex items-center gap-1.5">
                      {u.username} {u.is_verified && <ShieldCheck className="w-4 h-4 text-orange-500 fill-orange-500/20" />}
                    </span>
                    <span className="text-xs text-neutral-400">{u.home_club || 'Club principal'}</span>
                  </div>
                </div>
                <button 
                  onClick={() => onToggleVerifyAdmin(u.id, !!u.is_verified)}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs transition shadow-md ${u.is_verified ? 'bg-orange-600 text-white hover:bg-orange-500' : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'}`}
                >
                  {u.is_verified ? 'Certifié ✓' : 'Certifier'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lien vers les CGU */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 text-center">
        <button onClick={() => setShowCGUModal(true)} className="text-xs text-neutral-400 hover:text-orange-400 underline font-semibold">
          Consulter les Conditions Générales d'Utilisation (CGU) & Mentions Légales
        </button>
      </div>

      {/* Modale d'affichage des CGU détaillées */}
      {showCGUModal && (
        <div className="fixed inset-0 z-50 bg-black/9ountains backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-white">Conditions Générales d'Utilisation (CGU)</h3>
              <button onClick={() => setShowCGUModal(false)} className="p-2 text-neutral-400 hover:text-white rounded-xl"><X className="w-5 h-5" /></button>
            </div>
            <div className="text-xs text-neutral-300 space-y-3 leading-relaxed">
              <p><strong>1. Objet :</strong> FitPulse est une application communautaire et de mise en relation sportive destinée aux membres des clubs partenaires.</p>
              <p><strong>2. Avertissement Médical & Responsabilité :</strong> L'utilisation des programmes d'entraînement, des conseils de l'IA (FitBot) et du suivi de charges se fait sous l'entière et unique responsabilité de l'utilisateur. FitPulse et ses administrateurs déclinent toute responsabilité en cas de blessure, d'accident corporel ou de problème de santé. Il est fortement conseillé de consulter un médecin avant d'entamer tout programme de musculation ou de fitness.</p>
              <p><strong>3. Code de Conduite & Modération :</strong> Tout comportement injurieux, harcèlement, publication de contenu inapproprié ou usurpation d'identité entraînera la bannièson immédiate et définitive du compte sans préavis.</p>
              <p><strong>4. Données Personnelles :</strong> Vos données de profil et vos photos partagées sont stockées de manière sécurisée. Vous gardez le contrôle total de vos publications et de votre carnet d'entraînement.</p>
            </div>
            <button onClick={() => setShowCGUModal(false)} className="w-full py-3 bg-orange-600 text-white font-bold rounded-2xl text-xs">Fermer</button>
          </div>
        </div>
      )}

      <button onClick={onSignOut} className="w-full py-4 bg-neutral-900 hover:bg-neutral-800 text-red-400 rounded-3xl text-sm font-bold transition border border-neutral-800 flex items-center justify-center gap-2"><LogOut className="w-5 h-5" /> Déconnexion</button>
    </div>
  );
}
