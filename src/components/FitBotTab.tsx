import { useState, useRef, useEffect, FormEvent } from 'react';
import { Bot, Send, User, ArrowLeft } from 'lucide-react';

interface FitBotTabProps {
  currentUserProfile?: any;
  currentReadinessScore?: number;
  onBack?: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function FitBotTab({ currentUserProfile, currentReadinessScore = 80, onBack }: FitBotTabProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Salut ${currentUserProfile?.username || 'Athlète'} ! Je suis ton coach IA FitBot. Je vois que ton indice de forme est à ${currentReadinessScore}%. Comment puis-je t'aider aujourd'hui sur ton entraînement ou ta nutrition ?`
    }
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

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsLoading(true);

    try {
      setTimeout(() => {
        let aiReply = "C'est noté ! ";
        const lower = userText.toLowerCase();

        if (lower.includes('fatigue') || lower.includes('courbature') || lower.includes('recup')) {
          aiReply += `Avec un score de forme de ${currentReadinessScore}%, je te conseille de privilégier une séance active légère ou du stretching si tu te sens lourd. Évite l'intensité maximale aujourd'hui.`;
        } else if (lower.includes('manger') || lower.includes('faim') || lower.includes('repas') || lower.includes('macro')) {
          aiReply += `Pour ta nutrition post-WOD, vise un ratio de 3 pour 1 en glucides et protéines pour reconstituer tes stocks de glycogène rapidement. Un mix de riz, poulet ou un shaker avec une banane fera l'affaire.`;
        } else if (lower.includes('marathon') || lower.includes('course') || lower.includes('vma')) {
          aiReply += `Concernant ta préparation course (VMA: ${currentUserProfile?.vma || 14} km/h), veille à bien respecter tes allures de seuil et à ne pas négliger l'hydratation avec électrolytes lors de tes sorties longues.`;
        } else {
          aiReply += `En tant que ton coach expert, je te recommande de rester constant dans tes blocs d'entraînement et de bien écouter les signaux de ton corps. As-tu une question précise sur ton programme de la semaine ?`;
        }

        setMessages(prev => [...prev, { role: 'assistant', content: aiReply }]);
        setIsLoading(false);
      }, 1000);

    } catch (err) {
      console.error("Erreur FitBot :", err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, j'ai rencontré un petit souci technique. Réessaie dans un instant !" }]);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900 border border-cyan-500/30 rounded-3xl p-4 sm:p-6 flex flex-col h-[75vh] shadow-2xl relative overflow-hidden">
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* En-tête FitBot */}
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
              Coach FitBot AI <span className="text-[9px] bg-cyan-500/20 text-cyan-400 font-extrabold px-2 py-0.5 rounded-full border border-cyan-500/30">Pro 🛰️</span>
            </h3>
            <p className="text-[10px] text-neutral-400">Analyse temps réel • VMA: {currentUserProfile?.vma || 14} km/h • Forme: {currentReadinessScore}%</p>
          </div>
        </div>
      </div>

      {/* Zone de conversation */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 relative z-10">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-1 border border-cyan-500/30">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-orange-600 text-white rounded-tr-none shadow-lg' 
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
          placeholder="Pose ta question au coach (ex: Que manger ce soir ?)..."
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
