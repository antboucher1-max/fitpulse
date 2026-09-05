import { useState } from 'react';
import { ChevronRight, ChevronLeft, Zap, Target, Dumbbell, MapPin, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';
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
  const [age, setAge] = useState<number | ''>(32);
  const [goal, setGoal] = useState('Prise de masse / Force');
  const [discipline, setDiscipline] = useState('Fitness / Musculation');
  const [spot, setSpot] = useState('');
  const [acceptedMedical, setAcceptedMedical] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async () => {
    if (!spot.trim()) {
      alert("Merci d'indiquer ton spot ou ta ville principale !");
      return;
    }
    if (age === '' || Number(age) < 15 || Number(age) > 99) {
      alert("Merci d'indiquer un âge valide (entre 15 et 99 ans) pour le calcul de votre charge et le matching !");
      return;
    }
    if (!acceptedMedical) {
      alert("Veuillez accepter l'avertissement de non-responsabilité médicale pour continuer.");
      return;
    }

    setSubmitting(true);
    try {
      const profileData = {
        id: user.id,
        username: username.trim() || 'Athlète',
        age: Number(age),
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
        
        {/* ÉTAPE 1 : IDENTITÉ, GENRE & ÂGE */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">Étape 1 sur 4</span>
              <h2 className="text-2xl font-black text-white pt-2">Qui es-tu ?</h2>
              <p className="text-xs text-neutral-400">Entre ton pseudo, ton genre et ton âge pour calibrer ton profil.</p>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1.5">Ton Pseudo</label>
                <input 
                  type="text" 
                  autoFocus 
                  required 
                  placeholder="Ex: Antoine" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-orange-500 rounded-2xl px-4 py-3.5 text-sm text-white transition outline-none shadow-inner" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1.5">Ton Âge</label>
                <div className="relative">
                  <input 
                    type="number" 
                    min="15" 
                    max="99" 
                    value={age} 
                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Ex: 32"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-orange-500 rounded-2xl px-4 py-3.5 text-sm text-white transition outline-none shadow-inner"
                    required
                  />
                  <span className="absolute right-4 top-3.5 text-xs text-neutral-500 font-semibold">ans</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1.5">Genre / Identité</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Homme', label: '👨 Homme' },
                    { id: 'Femme', label: '👩 Femme' },
                    { id: 'Non-binaire', label: '⚡ Non-binaire' },
                    { id: 'Non spécifié', label: '🔒 Préfère ne pas dire' }
                  ].map(g => (
                    <div 
                      key={g.id} 
                      onClick={() => setGender(g.id)} 
                      className={`p-3 rounded-2xl border text-center text-xs font-black cursor-pointer transition flex items-center justify-center gap-1.5 ${
                        gender === g.id 
                          ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-lg' 
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      {g.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 : OBJECTIF PRINCIPAL */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">Étape 2 sur 4</span>
              <h2 className="text-2xl font-black text-white pt-2">Quel est ton objectif ?</h2>
              <p className="text-xs text-neutral-400">Choisis l'orientation principale de ta préparation.</p>
            </div>

            <div className="space-y-2 pt-1 max-h-[45vh] overflow-y-auto pr-1">
              {GOALS.map(item => (
                <div
                  key={item.id}
                  onClick={() => setGoal(item.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col gap-1 ${
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

        {/* ÉTAPE 4 : LE SPOT & DISCLAIMER MÉDICAL */}
        {step === 4 && (
          <div className="space-y-3.5 animate-fadeIn">
            <div className="text-center space-y-0.5">
              <span className="text-[10px] uppercase font-black tracking-widest text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">Étape 4 sur 4</span>
              <h2 className="text-xl font-black text-white pt-1">Ton QG & Sécurité</h2>
              <p className="text-[11px] text-neutral-400">Finalise ton profil pour rejoindre la communauté.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-orange-500" /> Ville, Salle ou Spot principal
                </label>
                <input 
                  type="text" 
                  autoFocus 
                  required 
                  placeholder="Ex: Tournai, Paris, Basic-Fit..." 
                  value={spot} 
                  onChange={(e) => setSpot(e.target.value)} 
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-orange-500 rounded-xl px-3.5 py-3 text-xs text-white transition outline-none shadow-inner" 
                />
              </div>

              {/* ⚠️ DISCLAIMER LÉGAL DE NON-RESPONSABILITÉ MÉDICALE */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-400 font-black text-[10px] uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5" /> Avertissement Santé & Non-Médical
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed">
                  <strong className="text-neutral-200">FitPulse</strong> est un outil de suivi sportif et de communauté. L'application <strong className="text-neutral-200">n'est pas un dispositif médical</strong> et ne remplace pas un avis professionnel. En cas de douleur ou de pathologie, consultez toujours un médecin.
                </p>
                <div className="flex items-start gap-2 pt-1 border-t border-neutral-900">
                  <input 
                    type="checkbox" 
                    id="medicalCheck" 
                    checked={acceptedMedical}
                    onChange={(e) => setAcceptedMedical(e.target.checked)}
                    className="rounded accent-orange-500 mt-0.5 cursor-pointer" 
                  />
                  <label htmlFor="medicalCheck" className="text-[10px] text-neutral-300 cursor-pointer leading-tight">
                    Je comprends que FitPulse est un assistant sportif et non un substitut médical.
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Boutons de Navigation */}
        <div className="flex items-center gap-3 pt-3 border-t border-neutral-800/80">
          {step > 1 && (
            <button 
              type="button" 
              onClick={() => setStep(prev => prev - 1)} 
              className="p-3.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-2xl transition cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <button 
            type="button" 
            onClick={() => {
              if (step === 1) {
                if (!username.trim()) {
                  alert("Entre un pseudo pour continuer !");
                  return;
                }
                if (age === '' || Number(age) < 15 || Number(age) > 99) {
                  alert("Merci d'indiquer un âge valide !");
                  return;
                }
              }
              if (step === 4 && !acceptedMedical) {
                alert("Veuillez accepter l'avertissement de santé pour valider votre inscription.");
                return;
              }
              if (step < 4) {
                setStep(prev => prev + 1);
              } else {
                handleFinish();
              }
            }}
            disabled={submitting}
            className="flex-1 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl text-xs transition shadow-[0_0_20px_rgba(234,88,12,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            {step < 4 ? "Continuer" : submitting ? "Création..." : "Rejoindre la meute 🚀"}
            {step < 4 && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </div>
  );
}
