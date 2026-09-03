import { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Dumbbell, Activity, Trophy, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

interface HybridCalendarProps {
  posts: any[];
  currentUserId?: string;
  onRefresh?: () => void;
}

export default function HybridCalendar({ posts, currentUserId, onRefresh }: HybridCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // États du formulaire de programmation
  const [sessionType, setSessionType] = useState('Musculation Full Body');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Charger les événements locaux stockés dans le navigateur
  const [localEvents, setLocalEvents] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('fitpulse_local_events');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fusionner les posts de Supabase et les événements locaux de l'utilisateur
  const userActivities = useMemo(() => {
    const remote = posts.filter(p => p.user_id === currentUserId);
    return [...remote, ...localEvents];
  }, [posts, currentUserId, localEvents]);

  // Générer les jours du mois en cours
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Dimanche

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Mapper les activités par date (format YYYY-MM-DD)
  const activitiesByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    userActivities.forEach(act => {
      if (!act.created_at) return;
      const dateStr = act.created_at.split('T')[0];
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(act);
    });
    return map;
  }, [userActivities]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (dayNum: number) => {
    const formattedMonth = (month + 1).toString().padStart(2, '0');
    const formattedDay = dayNum.toString().padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    setSelectedDateStr(dateStr);
    setIsModalOpen(true);
  };

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !selectedDateStr) return;

    setLoading(true);
    try {
      const newEvent = {
        id: 'local_' + Date.now(),
        user_id: currentUserId,
        session_type: `📅 [Prévu] ${sessionType}`,
        caption: description || 'Séance ou événement programmé',
        created_at: `${selectedDateStr}T08:00:00.000Z`
      };

      const updatedEvents = [...localEvents, newEvent];
      setLocalEvents(updatedEvents);
      localStorage.setItem('fitpulse_local_events', JSON.stringify(updatedEvents));

      setIsModalOpen(false);
      setDescription('');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert("Erreur lors de la programmation : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-xl space-y-4">
      
      {/* En-tête du calendrier */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-orange-500" />
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            Hybrid Calendar • {monthNames[month]} {year}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handlePrevMonth}
            className="p-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-neutral-300 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-neutral-300 transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Légende rapide */}
      <div className="flex flex-wrap items-center justify-between border-b border-neutral-800 pb-3 text-[10px] font-bold text-neutral-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><Dumbbell className="w-3.5 h-3.5 text-orange-500" /> Force</span>
          <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-emerald-400" /> Cardio</span>
          <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-amber-400" /> Events</span>
        </div>
        <span className="text-neutral-500 italic">Clique sur un jour pour programmer 💡</span>
      </div>

      {/* Grille des jours de la semaine */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((d, i) => (
          <span key={i} className="text-[10px] font-bold text-neutral-500 py-1">{d}</span>
        ))}

        {/* Espaces vides pour aligner le premier jour du mois */}
        {Array.from({ length: (firstDayIndex === 0 ? 6 : firstDayIndex - 1) }).map((_, index) => (
          <div key={`empty-${index}`} className="h-16 bg-neutral-950/40 rounded-xl border border-transparent opacity-20" />
        ))}

        {/* Jours du mois */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const dayNum = index + 1;
          const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
          const formattedMonth = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
          const dateString = `${year}-${formattedMonth}-${formattedDay}`;
          
          const dayActivities = activitiesByDate[dateString] || [];
          const hasCompetition = dayActivities.some(a => a.session_type?.toLowerCase().includes('marathon') || a.session_type?.toLowerCase().includes('course') || a.session_type?.toLowerCase().includes('hyrox') || a.session_type?.toLowerCase().includes('crossfit') || a.session_type?.toLowerCase().includes('concours') || a.session_type?.toLowerCase().includes('event'));
          const hasRunning = dayActivities.some(a => (a.session_type?.toLowerCase().includes('cardio') || a.session_type?.toLowerCase().includes('running') || a.session_type?.toLowerCase().includes('footing') || a.session_type?.toLowerCase().includes('prévu')) && !hasCompetition);
          const hasMuscu = dayActivities.some(a => !hasRunning && !hasCompetition);

          const isToday = new Date().toISOString().split('T')[0] === dateString;

          return (
            <div 
              key={dateString}
              onClick={() => handleDayClick(dayNum)}
              className={`h-16 rounded-xl border p-1.5 flex flex-col justify-between transition relative overflow-hidden cursor-pointer group ${
                isToday 
                  ? 'bg-neutral-800 border-orange-500 shadow-md' 
                  : dayActivities.length > 0 
                    ? 'bg-neutral-950 border-neutral-700 hover:border-orange-500/50' 
                    : 'bg-neutral-950/60 border-neutral-800/60 hover:border-neutral-700'
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <span className={`text-[10px] font-bold ${isToday ? 'text-orange-400 font-black' : 'text-neutral-400'}`}>
                  {dayNum}
                </span>
                <Plus className="w-3 h-3 text-neutral-600 opacity-0 group-hover:opacity-100 transition" />
              </div>

              {/* Indicateurs d'activités et compétitions unifiées */}
              <div className="flex flex-col gap-0.5 mt-auto">
                {hasCompetition && (
                  <div className="bg-amber-500/20 border border-amber-500/40 rounded px-1 py-0.5 flex items-center gap-1 text-[8px] font-bold text-amber-400 truncate">
                    <Trophy className="w-2.5 h-2.5 flex-shrink-0" /> Event
                  </div>
                )}
                {hasMuscu && dayActivities.length > 0 && !hasCompetition && (
                  <div className="bg-orange-500/20 border border-orange-500/40 rounded px-1 py-0.5 flex items-center gap-1 text-[8px] font-bold text-orange-400 truncate">
                    <Dumbbell className="w-2.5 h-2.5 flex-shrink-0" /> Force
                  </div>
                )}
                {hasRunning && !hasCompetition && (
                  <div className="bg-emerald-500/20 border border-emerald-500/40 rounded px-1 py-0.5 flex items-center gap-1 text-[8px] font-bold text-emerald-400 truncate">
                    <Activity className="w-2.5 h-2.5 flex-shrink-0" /> Cardio
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODALE DE PROGRAMMATION AU CLIC */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-orange-500" /> Programmer le {selectedDateStr}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-neutral-400 hover:text-white rounded-xl cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Type de séance ou Compétition :</label>
                <select 
                  value={sessionType} 
                  onChange={(e) => setSessionType(e.target.value)} 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none"
                >
                  <option value="Musculation Full Body">💪 Musculation Full Body</option>
                  <option value="Push / Force">🏋️‍♂️ Push / Force</option>
                  <option value="Pull / Dos">🦾 Pull / Dos</option>
                  <option value="Jambes / Squat">🦵 Jambes / Squat</option>
                  <option value="Footing / VMA">🏃‍♂️ Footing / VMA</option>
                  <option value="WOD / Crossfit">⚡ WOD / Crossfit</option>
                  <option value="Repos / Mobilité">🧘‍♂️ Repos / Mobilité</option>
                  <option value="🏁 Marathon / Semi-Marathon">🏁 Marathon / Semi-Marathon</option>
                  <option value="🏃 Course officielle (10k / 20k)">🏃 Course officielle (10k / 20k)</option>
                  <option value="⚡ Compétition Hyrox">⚡ Compétition Hyrox</option>
                  <option value="🏋️‍♂️ Concours CrossFit / WOD Battle">🏋️‍♂️ Concours CrossFit / WOD Battle</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Détails ou Objectif :</label>
                <textarea 
                  rows={3} 
                  placeholder="Ex: Objectif sub 3h30 au marathon ou heat 2 en Hyrox..." 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none" 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl text-xs shadow-xl transition cursor-pointer disabled:opacity-50"
              >
                {loading ? "Programmation..." : "Valider et planifier l'événement 🚀"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
