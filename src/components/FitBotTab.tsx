import { useState, useRef, useEffect, FormEvent } from 'react';
import { Bot, Send, User, ArrowLeft } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { askFitBotAI } from '../services/fitbotService';

interface FitBotTabProps {
  currentUserProfile?: any;
  onBack?: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
}

// Réécrit pour utiliser un vrai modèle de langage (via la Edge Function
// Supabase fitbot-chat) au lieu de réponses pré-écrites détectées par
// mots-clés. Le coach comprend maintenant des questions ouvertes ; s'il ne
// comprend pas, il le dit et demande une clarification au lieu de planter ou
// de sortir une réponse hors sujet.
export default function FitBotTab({ currentUserProfile, onBack }: FitBotTabProps) {
  const { readiness, trainingLoad, discipline, sessions } = useAppState();
  const username = currentUserProfile?.username || 'Athlète';

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Salut ${username} ! Je suis FitBot, ton coach. Pose-moi une question sur ton entraînement, ta récupération ou ta nutrition — je m'appuie sur tes vraies données pour te répondre.`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const buildRecentSessionsSummary = (): string => {
    const last7Days = sessions.filter((s) => {
      if (!s.createdAt) return false;
      const diffDays = (Date.now() - new Date(s.createdAt).getTime()) / (24 * 60 * 60 * 1000);
      return diffDays <= 7;
    });
    if (last7Days.length === 0) return 'Aucune séance enregistrée cette semaine.';
    const counts: Record<string, number> = {};
    last7Days.forEach((s) => { counts[s.type] = (counts[s.type] || 0) + 1; });
    return Object.entries(counts).map(([type, n]) => `${n} séance(s) de ${type}`).join(', ');
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setIsLoading(true);

    const result = await askFitBotAI(userText, {
      username,
      readinessScore: readiness.score,
      trainingLoad,
      discipline,
      recentSessionsSummary: buildRecentSessionsSummary(),
    });

    setMessages((prev) => [...prev, { role: 'assistant', content: result.reply, isError: result.error }]);
    setIsLoading(false);
  };

  return (
    <div className="bg-neutral-900 border border-cyan-500/30 rounded-3xl p-4 sm:p-6 flex flex-col h-[75vh] shadow-2xl relative overflow-hidden">
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* En-tête Proactif */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800 relative z-10">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              type="button" 
              onClick={onBack} 
              className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              Coach FitBot AI Proactif <span className="text-[9px] bg-cyan-500/20 text-cyan-400 font-extrabold px-2 py-0.5 rounded-full border border-cyan-500/30">Autonome 🛰️</span>
            </h3>
            <p className="text-[10px] text-neutral-400">Coach conversationnel • Forme : {readiness.score > 0 ? `${readiness.score}%` : 'check-in non fait'}</p>
          </div>
        </div>
      </div>

      {/* Zone de discussion */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 relative z-10">
        {messages.map((msg, index) => (
          <div key={index} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-1 border border-cyan-500/30">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                msg.role === 'user' 
                  ? 'bg-orange-600 text-white rounded-tr-none shadow-lg' 
                  : msg.isError 
                    ? 'bg-red-950/40 text-red-200 border border-red-500/40 rounded-tl-none shadow-xl'
                    : 'bg-neutral-950 text-neutral-200 border border-neutral-800 rounded-tl-none shadow-inner'
              }`}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0 mt-1 border border-orange-500/30">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 justify-start items-center">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-2xl text-xs text-neutral-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Barre de saisie */}
      <form onSubmit={handleSendMessage} className="pt-3 border-t border-neutral-800 flex gap-2 relative z-10">
        <input 
          type="text" 
          placeholder="Discute avec ton coach proactif..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500"
        />
        <button 
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="px-4 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-2xl transition cursor-pointer flex items-center justify-center shadow-lg"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
