import React from 'react';
import { Camera, ShieldCheck, ImageIcon, Key, LogOut } from 'lucide-react';
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

export default function ProfileTab({
  user, currentUserProfile, userAvatarUrl, isAdmin, registeredUsers, transformations,
  newTransBefore, newTransAfter, newTransWeight, newTransNote, newTransIsPrivate,
  setNewTransWeight, setNewTransNote, setNewTransIsPrivate, onAvatarClick, onAddTransformation,
  onShareTransformation, onUpdatePasswordSubmit, password, setPassword, confirmPassword,
  setConfirmPassword, isPrivateMode, setIsPrivateMode, onSignOut, onToggleVerifyAdmin,
  beforeFileInputRef, afterFileInputRef
}: ProfileTabProps) {
  return (
    <div className="space-y-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center space-y-4">
        <div className="relative w-24 h-24 mx-auto group cursor-pointer" onClick={onAvatarClick}>
          <img src={userAvatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover border-2 border-orange-500 shadow-xl" />
          <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition"><Camera className="w-6 h-6 text-white" /></div>
        </div>
        <h2 className="font-extrabold text-lg text-white flex items-center justify-center gap-1.5">
          {user?.user_metadata?.first_name || user?.email?.split('@')[0]}
          {currentUserProfile?.is_verified && <ShieldCheck className="w-5 h-5 text-orange-500 fill-orange-500/20" />}
        </h2>
      </div>

      {isAdmin && (
        <div className="bg-neutral-900 border border-orange-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <h3 className="text-sm font-black text-orange-400 flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Gestion des Certifications (Admin)</h3>
          <div className="space-y-2 pt-1 max-h-60 overflow-y-auto">
            {registeredUsers.map(u => (
              <div key={u.id} className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 flex items-center justify-between text-xs">
                <span className="font-bold text-white">{u.username}</span>
                <button onClick={() => onToggleVerifyAdmin(u.id, !!u.is_verified)} className={`px-3 py-1.5 rounded-xl font-bold ${u.is_verified ? 'bg-orange-600 text-white' : 'bg-neutral-900 text-neutral-400'}`}>
                  {u.is_verified ? 'Certifié ✓' : 'Certifier'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2"><ImageIcon className="w-4 h-4 text-orange-500" /> Carnet Avant/Après</h3>
        <form onSubmit={onAddTransformation} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <input type="number" step="0.1" placeholder="Poids (kg)" value={newTransWeight} onChange={(e) => setNewTransWeight(e.target.value === '' ? '' : Number(e.target.value))} className="bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white" />
            <input type="text" placeholder="Note" value={newTransNote} onChange={(e) => setNewTransNote(e.target.value)} className="bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white" />
          </div>
          <button type="submit" className="w-full py-2.5 bg-orange-600 text-white font-bold rounded-xl text-sm">Enregistrer</button>
        </form>
      </div>

      <button onClick={onSignOut} className="w-full py-4 bg-neutral-900 text-red-400 rounded-3xl text-sm font-bold border border-neutral-800 flex items-center justify-center gap-2"><LogOut className="w-5 h-5" /> Déconnexion</button>
    </div>
  );
}
