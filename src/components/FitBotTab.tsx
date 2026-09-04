import { useState, useRef, useEffect, FormEvent } from 'react';
import { Bot, Send, User, ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface FitBotTabProps {
  currentUserProfile?: any;
  currentReadinessScore?: number;
  onBack?: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isProactiveAlert?: boolean;
}

export default function FitBotTab({ currentUserProfile, currentReadinessScore = 80, onBack }: FitBotTabProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Salut ${currentUserProfile?.username || 'Athlète'} ! Analyse matinale terminée. Ton indice de forme est à ${currentReadinessScore}%.`,
    },
    {
      role: 'assistant',
      content: `🚨 **Alerte Proactive Coach** : J'ai analysé tes 3 dernières séances sur le fil. Ta charge d'entraînement augmente de 40% cette semaine, ce qui dépasse les recommandations de sécurité pour ton objectif. \n\n👉 *Suggestion : Je t'ai modifié ton WOD de demain en une session axée sur la récupération active et le gainage léger pour éviter le surmenage.* Veux-tu valider ce nouveau planning ?`,
      isProactiveAlert: true
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [wodModified, setWodModified] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleAcceptWodChange = () => {
    setWodModified(true);
    setMessages(prev => [
      ...prev,
      { role: 'user', content: "Oui, valide la modification de mon WOD de demain." },
      { role: 'assistant', content: "✅ C'est fait ! Ton calendrier a été mis à jour automatiquement. Repose-toi bien ce soir, la forme reviendra plus forte après-demain." }
    ]);
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsLoading(true);

    try {
      setTimeout(() => {
        let aiReply = "C'est bien noté ! ";
        const lower = userText.toLowerCase();

        if (lower.includes('fatigue') || lower.includes('courbature') || lower.includes('recup')) {
          aiReply += `Avec ton score de ${currentReadinessScore}%, écoute ton système nerveux. Une bonne nuit et des apports adaptés en micronutriments vont régler ça.`;
        } else if (lower.includes('manger') || lower.includes('faim') || lower.includes('recette') || lower.includes('frigo')) {
          aiReply += `Pense à utiliser le **Scan Frigo** juste en un clic depuis l'accueil pour que je t'invente une recette flash basée sur tes protéines actuelles !`;
        } else {
          aiReply += `Je veille sur ta progression. N'hésite pas si tu veux ajuster tes allures de course ou tes charges en musculation.`;
        }

        setMessages(prev => [...prev, { role: 'assistant', content: aiReply }]);
        setIsLoading(false);
      }, 1000);

    } catch (err) {
      console.error("Erreur FitBot :", err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, petit souci technique. Réessaie dans un instant !" }]);
      setIsLoading(false);
    }
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
            <p className="text-[10px] text-neutral-400">Analyse de surcharge active • Forme : {currentReadinessScore}%</p>
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
                  : msg.isProactiveAlert 
                    ? 'bg-amber-950/40 text-amber-200 border border-amber-500/40 rounded-tl-none shadow-xl'
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

            {/* Bouton d'action proactif si l'alerte est présente et non encore validée */}
            {msg.isProactiveAlert && !wodModified && (
              <div className="pl-9">
                <button
                  type="button"
                  onClick={handleAcceptWodChange}
                  className="py-2 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Appliquer la modification du WOD
                </button>
              </div>
            )}
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
