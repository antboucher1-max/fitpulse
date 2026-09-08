import { useState, useEffect, useRef } from 'react';
import { Send, User, Clock, CheckCheck } from 'lucide-react';
import { supabase } from '../supabaseClient';

// NOTE SUR LE SCHÉMA : ce fichier utilise la colonne `content` pour le texte
// du message. C'est ce qui était déjà écrit dans la version d'origine de ce
// composant — mais ChatTab.tsx (un autre composant de chat du projet) et le
// type DBMessage dans types.ts utilisent `text`. Vérifie dans Supabase →
// Table Editor → table `messages` quel est le VRAI nom de colonne avant de
// tester, et harmonise les deux composants sur le même nom une fois confirmé
// — sinon l'un des deux échouera silencieusement à l'envoi ou à la lecture.

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

interface BuddiesChatProps {
  currentUserId: string;
  buddyId: string;
  buddyName: string;
}

export default function BuddiesChat({ currentUserId, buddyId, buddyName }: BuddiesChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Charger l'historique des messages au montage
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${buddyId}),and(sender_id.eq.${buddyId},receiver_id.eq.${currentUserId})`
        )
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erreur chargement messages:', error.message);
      } else {
        setMessages(data || []);
      }
    };

    fetchMessages();

    // 2. Écouter les nouveaux messages en temps réel (Supabase Realtime) —
    // remplace tout mécanisme de rafraîchissement en boucle.
    const channel = supabase
      .channel(`buddies-chat-${[currentUserId, buddyId].sort().join('-')}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as Message;
          if (
            (newMsg.sender_id === currentUserId && newMsg.receiver_id === buddyId) ||
            (newMsg.sender_id === buddyId && newMsg.receiver_id === currentUserId)
          ) {
            setMessages((prev) => {
              // Remplace le message optimiste temporaire par le vrai s'il
              // existe déjà (même expéditeur + même contenu très récent),
              // sinon l'ajoute simplement.
              const withoutTemp = prev.filter(
                (m) => !(m.id.startsWith('temp-') && m.content === newMsg.content && m.sender_id === newMsg.sender_id)
              );
              if (withoutTemp.some((m) => m.id === newMsg.id)) return withoutTemp;
              return [...withoutTemp, newMsg];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, buddyId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const messageText = newMessage.trim();

    // Ajout optimiste (optimistic UI) pour une sensation de vitesse — l'id
    // temporaire commence par "temp-" pour être reconnu et remplacé une fois
    // le vrai message reçu via l'abonnement temps réel ci-dessus.
    const tempMessage: Message = {
      id: `temp-${crypto.randomUUID()}`,
      sender_id: currentUserId,
      receiver_id: buddyId,
      content: messageText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage('');

    try {
      const { error } = await supabase.from('messages').insert([
        {
          sender_id: currentUserId,
          receiver_id: buddyId,
          content: messageText,
        },
      ]);

      if (error) throw error;
    } catch (error: any) {
      console.error("Erreur lors de l'envoi :", error.message);
      // Retire le message optimiste si l'envoi a réellement échoué, pour ne
      // pas laisser croire à l'utilisateur que le message est parti.
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
      setNewMessage(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[600px] bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
      {/* HEADER DU CHAT */}
      <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white shadow-lg">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-white font-black text-sm tracking-wide">{buddyName}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] text-neutral-400 font-medium">En ligne • FitPulse Buddies</span>
          </div>
        </div>
      </div>

      {/* ZONE DES MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-900/50 scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-neutral-500 space-y-3">
            <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center">
              <CheckCheck className="w-6 h-6 text-neutral-600" />
            </div>
            <p className="text-xs font-medium">Démarre la conversation avec {buddyName}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[75%] p-3 rounded-2xl relative group ${
                    isMe 
                      ? 'bg-orange-600 text-white rounded-tr-sm shadow-orange-900/20 shadow-lg' 
                      : 'bg-neutral-800 text-neutral-200 rounded-tl-sm border border-neutral-700'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <div className={`flex items-center gap-1 mt-1.5 ${isMe ? 'text-orange-200' : 'text-neutral-500'} justify-end`}>
                    <Clock className="w-3 h-3" />
                    <span className="text-[9px] font-mono">{formatTime(msg.created_at)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ZONE DE SAISIE */}
      <div className="p-4 bg-neutral-950 border-t border-neutral-800 shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Ton message..."
            className="flex-1 bg-neutral-900 border border-neutral-700 text-white text-sm rounded-2xl py-3 px-4 resize-none h-[50px] min-h-[50px] max-h-[120px] focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition placeholder:text-neutral-500"
            rows={1}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="h-[50px] w-[50px] shrink-0 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:hover:bg-orange-600 text-white rounded-2xl flex items-center justify-center transition cursor-pointer shadow-lg shadow-orange-900/20"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
