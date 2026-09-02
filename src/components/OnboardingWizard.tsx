import { useState } from 'react';
import { ChevronRight, ChevronLeft, Zap, Target, Dumbbell, MapPin, CheckCircle2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://obtahwmcoqrcauscpksv.supabase.co';
const supabaseAnonKey = 'sb_publishable_O8CKhUtzgq9nO9lKavNE9A__fAdRWoB';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface OnboardingWizardProps {
  user: any;
  onComplete: () => void;
}

const GOALS = [
  { id: 'Prise de masse / Force', label: '💪 Prise de masse & Force', desc: 'Développer l’hypertrophie et les charges lourdes.' },
  { id: 'Course & Endurance', label: '🏃‍♂️ Course & Cardio', desc: 'Préparer un 10k, un semi ou un marathon.' },
  { id: 'Hybride (Muscu + Cardio)', label: '⚡ Athlète Hybride', desc: 'Le meilleur des deux mondes (Cross-training).' },
  { id: 'Remise en forme / Santé', label: '🔥 Perte de poids & Tonus', desc: 'Retrouver de l’énergie et sculpter sa silhouette.' }
];

const DISCIPLINES = [
  { id: 'Fitness / Musculation', label: '🏋️‍♂️ Fitness & Musculation en salle' },
  { id: 'Course à pied', label: '🛣️ Route, Piste & Trail' },
  { id: 'Crossfit', label: '📦 Box & WODs fonctionnels' }
];

export default function OnboardingWizard({ user, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('Homme');
  const [goal, setGoal] = useState('Prise de masse / Force');
  const [discipline, setDiscipline] = useState('Fitness / Musculation');
  const [spot, setSpot] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async () => {
    if (!spot.trim()) {
      alert("Merci d'indiquer ton spot ou ta ville principale !");
      return;
    }

    setSubmitting(true);
    try {
      const profileData = {
        id: user.id,
        username: username.trim() || 'Athlète',
        home_club: spot.trim(),
        goal,
        gender,
        discipline,
        disciplines: discipline,
        points: 0,
        is_admin: user.email === 'antboucher@hotmail.fr',
        avatar_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150'
      };

      const { error } = await supabase.from('profiles').upsert(profileData);
      if (error) throw error;
      onComplete();
    } catch (err: any) {
      alert("Erreur lors de la configuration : " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center font-sans p-4 select-none relative overflow-hidden">
      
      {/* Barre de progression type Duolingo */}
      <div className="absolute top-8 w-full max-w-sm px-4">
        <div className="flex gap-1.5 w-full">
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s} 
              className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                step >= s ? 'bg-orange-500 shadow-[0_0_12px_rgba(234,88,12,0.5)]' : 'bg-neutral-800'
              }`} 
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-6 space-y-6 shadow-2xl relative animate-slideUp">
        
        {/* ÉTAPE 1 : IDENTITÉ */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">Étape 1 sur 4</span>
              <h2 className="text-2xl font-black text-white pt-2">Comment t'appelles-tu ?</h2>
              <p className="text-xs text-neutral-400">Entre ton pseudo pour ton profil d'athlète.</p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1.5">Ton Pseudo</label>
                <input 
                  type="text" 
                  autoFocus 
                  required 
                  placeholder="Ex: Antoine" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-orange-500 rounded-2xl px-4 py-4 text-sm text-white transition outline-none shadow-inner" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1.5">Genre</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {['Homme', 'Femme'].map(g => (
                    <div 
                      key={g} 
                      onClick={() => setGender(g)} 
                      className={`p-4 rounded-2xl border text-center text-xs font-black cursor-pointer transition flex items-center justify-center gap-2 ${
                        gender === g 
                          ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-lg' 
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      {g}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 : OBJECTIF PRINCIPAL (Grosses cartes Noom-style) */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">Étape 2 sur 4</span>
              <h2 className="text-2xl font-black text-white pt-2">Quel est ton objectif ?</h2>
              <p className="text-xs text-neutral-400">Choisis l'orientation principale de ta préparation.</p>
            </div>

            <div className="space-y-2.5 pt-1 max-h-[50vh] overflow-y-auto pr-1">
              {GOALS.map(item => (
                <div
                  key={item.id}
                  onClick={() => setGoal(item.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col gap-1 ${
                    goal === item.id 
                      ? 'bg-orange-600/20 border-orange-500 text-white shadow-lg' 
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black">{item.label}</span>
                    {goal === item.id && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
                  </div>
                  <p className="text-[10px] text-neutral-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ÉTAPE 3 : DISCIPLINE DOMINANTE */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">Étape 3 sur 4</span>
              <h2 className="text-2xl font-black text-white pt-2">Ton terrain de jeu ?</h2>
              <p className="text-xs text-neutral-400">Où vas-tu transpirer le plus souvent ?</p>
            </div>

            <div className="space-y-2.5 pt-2">
              {DISCIPLINES.map(item => (
                <div
                  key={item.id}
                  onClick={() => setDiscipline(item.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                    discipline === item.id 
                      ? 'bg-orange-600/20 border-orange-500 text-white shadow-lg' 
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <span className="text-xs font-black">{item.label}</span>
                  {discipline === item.id && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ÉTAPE 4 : LE SPOT / QG */}
        {step === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">Étape 4 sur 4</span>
              <h2 className="text-2xl font-black text-white pt-2">Ton QG d'entraînement ?</h2>
              <p className="text-xs text-neutral-400">Indique ta ville ou ta salle principale pour trouver des partenaires proches.</p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" /> Ville, Salle ou Spot
                </label>
                <input 
                  type="text" 
                  autoFocus 
                  required 
                  placeholder="Ex: Paris, Montréal, Tournai, Basic-Fit..." 
                  value={spot} 
                  onChange={(e) => setSpot(e.target.value)} 
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-orange-500 rounded-2xl px-4 py-4 text-sm text-white transition outline-none shadow-inner" 
                />
              </div>
            </div>
          </div>
        )}

        {/* Boutons de Navigation */}
        <div className="flex items-center gap-3 pt-4 border-t border-neutral-800/80">
          {step > 1 && (
            <button 
              type="button" 
              onClick={() => setStep(prev => prev - 1)} 
              className="p-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-2xl transition cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <button 
            type="button" 
            onClick={() => {
              if (step === 1 && !username.trim()) {
                alert("Entre un pseudo pour continuer !");
                return;
              }
              if (step < 4) {
                setStep(prev => prev + 1);
              } else {
                handleFinish();
              }
            }}
            disabled={submitting}
            className="flex-1 py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl text-sm transition shadow-[0_0_20px_rgba(234,88,12,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            {step < 4 ? "Continuer" : submitting ? "Création..." : "Rejoindre la meute 🚀"}
            {step < 4 && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </div>
  );
}
