import { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Dumbbell, Activity, Flame, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface HybridCalendarProps {
  posts: any[];
  currentUserId?: string;
}

export default function HybridCalendar({ posts, currentUserId }: HybridCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Filtrer les posts de l'utilisateur connecté
  const userActivities = useMemo(() => {
    return posts.filter(p => p.user_id === currentUserId);
  }, [posts, currentUserId]);

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
      <div className="flex items-center gap-4 text-[10px] font-bold text-neutral-400 border-b border-neutral-800 pb-3">
        <span className="flex items-center gap-1"><Dumbbell className="w-3.5 h-3.5 text-orange-500" /> Musculation / Force</span>
        <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-emerald-400" /> Course à pied / Cardio</span>
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
          const hasRunning = dayActivities.some(a => a.session_type?.toLowerCase().includes('cardio') || a.session_type?.toLowerCase().includes('running') || a.session_type?.toLowerCase().includes('footing'));
          const hasMuscu = dayActivities.some(a => !hasRunning);

          const isToday = new Date().toISOString().split('T')[0] === dateString;

          return (
            <div 
              key={dateString}
              className={`h-16 rounded-xl border p-1.5 flex flex-col justify-between transition relative overflow-hidden ${
                isToday 
                  ? 'bg-neutral-800 border-orange-500 shadow-md' 
                  : dayActivities.length > 0 
                    ? 'bg-neutral-950 border-neutral-700' 
                    : 'bg-neutral-950/60 border-neutral-800/60'
              }`}
            >
              <span className={`text-[10px] font-bold ${isToday ? 'text-orange-400 font-black' : 'text-neutral-400'}`}>
                {dayNum}
              </span>

              {/* Indicateurs d'activités unifiées */}
              <div className="flex flex-col gap-0.5 mt-auto">
                {hasMuscu && dayActivities.length > 0 && (
                  <div className="bg-orange-500/20 border border-orange-500/40 rounded px-1 py-0.5 flex items-center gap-1 text-[8px] font-bold text-orange-400 truncate">
                    <Dumbbell className="w-2.5 h-2.5 flex-shrink-0" /> Force
                  </div>
                )}
                {hasRunning && (
                  <div className="bg-emerald-500/20 border border-emerald-500/40 rounded px-1 py-0.5 flex items-center gap-1 text-[8px] font-bold text-emerald-400 truncate">
                    <Activity className="w-2.5 h-2.5 flex-shrink-0" /> Cardio
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
