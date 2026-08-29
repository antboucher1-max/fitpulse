import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, ArrowLeft, Trash2, Flag, Check } from 'lucide-react';
import { RealUser, DBMessage } from '../types';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://obtahwmcoqrcauscpksv.supabase.co';
const supabaseAnonKey = 'sb_publishable_O8CKhUtzgq9nO9lKavNE9A__fAdRWoB';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ChatTabProps {
  currentUserId?: string;
  selectedBuddyChat: RealUser | null;
  setSelectedBuddyChat: (user: RealUser | null) => void;
  activeChatUsers: RealUser[];
  currentChatMessages: DBMessage[];
  currentMessageInput: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: () => void;
  onSelectBuddy: (user: RealUser) => void;
  onDeleteConversation: () => void;
  onReportConversation: () => void;
  isOtherUserTyping: boolean;
  isMessageLimitReached: boolean;
  lastReadTimestamps: Record<string, number>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  allMessages?: DBMessage[];
}

const getUserStatus = (lastSeenString?: string) => {
  if (!lastSeenString) return { color: 'bg-neutral-500', text: 'Hors ligne' };
  
  const lastSeenTime = new Date(lastSeenString).getTime();
  const now = Date.now();
  const diffMinutes = Math.floor((now - lastSeenTime) / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffMinutes < 5) {
    return { color: 'bg-green-500 animate-pulse', text: 'En ligne' };
  } else if (diffMinutes < 60) {
    return { color: 'bg-red-500', text: `Actif il y a ${diffMinutes} min` };
  } else if (diffHours < 24) {
    return { color: 'bg-red-500', text: `Actif il y a ${diffHours}h` };
  } else {
    return { color: 'bg-neutral-500', text: 'Absent (+24h)' };
  }
};

export default function ChatTab({
  currentUserId,
  selectedBuddyChat,
  setSelectedBuddyChat,
  activeChatUsers,
  currentChatMessages,
  currentMessageInput,
  onInputChange,
  onSendMessage,
  onSelectBuddy,
  onDeleteConversation,
  onReportConversation,
  messagesEndRef,
  allMessages = []
}: ChatTabProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [remoteTyping, setRemoteTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Canal Realtime pour propager l'état de frappe "..." entre les 2 utilisateurs
  useEffect(() => {
    if (!selectedBuddyChat || !currentUserId) return;

    // Nom de canal unique basé sur les IDs des deux utilisateurs triés alphabétiquement
    const channelId = `room_${[currentUserId, selectedBuddyChat.id].sort().join('_')}`;
    const channel = supabase.channel(channelId);

    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.sender_id === selectedBuddyChat.id) {
          setRemoteTyping(payload.payload.isTyping);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedBuddyChat, currentUserId]);

  // Fonction appelée quand l'utilisateur tape dans l'input
  const handleInputWithTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(e);

    if (!selectedBuddyChat || !currentUserId) return;
    const channelId = `room_${[currentUserId, selectedBuddyChat.id].sort().join('_')}`;
    
    // Envoyer l'événement "en train d'écrire"
    supabase.channel(channelId).send({
      type: 'broadcast',
      event: 'typing',
      payload: { sender_id: currentUserId, isTyping: true }
    });

    // Arrêter l'indicateur après 2 secondes d'inactivité
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      supabase.channel(channelId).send({
        type: 'broadcast',
        event: 'typing',
        payload: { sender_id: currentUserId, isTyping: false }
      });
    }, 2000);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentChatMessages, remoteTyping]);

  if (!selectedBuddyChat) {
    return (
      <div className="space-y-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <h2 className="text-base font-black tracking-tight flex items-center gap-2 text-white">
            <MessageCircle className="w-5 h-5 text-orange-500" /> Messages Privés
          </h2>
          <p className="text-xs text-neutral-400">Sélectionne un(e) ami(e) pour lancer une discussion instantanée.</p>

          <div className="space-y-3 pt-2">
            {activeChatUsers.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-sm">
                Aucun(e) ami(e) pour le moment. Va dans l'onglet <span className="text-orange-400 font-bold">Buddies</span> pour ajouter des partenaires !
              </div>
            ) : (
              activeChatUsers.map((buddy: any) => {
                const status = getUserStatus(buddy.last_seen || buddy.created_at);
                const conversationMessages = allMessages.filter(
                  m => (m.sender_id === currentUserId && m.receiver_id === buddy.id) ||
                       (m.sender_id === buddy.id && m.receiver_id === currentUserId)
                );
                
                const lastMsg = conversationMessages[conversationMessages.length - 1];
                const isUnread = lastMsg && lastMsg.sender_id !== currentUserId;

                return (
                  <div 
                    key={buddy.id} 
                    onClick={() => onSelectBuddy(buddy)}
                    className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition shadow-md ${
                      isUnread 
                        ? 'bg-neutral-900 border-orange-500/60 shadow-orange-500/10' 
                        : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 relative flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <img src={buddy.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border border-neutral-800" />
                        <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-neutral-950 ${status.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-sm font-bold truncate ${isUnread ? 'text-orange-400' : 'text-white'}`}>
                            {buddy.username}
                          </h3>
                          {isUnread && (
                            <span className="bg-orange-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                              1 non lu
                            </span>
                          )}
                        </div>
                        <p className={`text-xs truncate mt-0.5 font-medium ${isUnread ? 'text-white font-semibold' : 'text-neutral-400'}`}>
                          {lastMsg ? (lastMsg.sender_id === currentUserId ? `Moi : ${lastMsg.text}` : lastMsg.text) : status.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  const buddyStatus = getUserStatus((selectedBuddyChat as any).last_seen);
  
  // Le "Vu" ne s'affiche que si le dernier message vient de TOI et que le destinataire a posté un message après ou qu'il est en ligne dans la conversation
  const myMessages = currentChatMessages.filter(m => m.sender_id === currentUserId);
  const lastMyMessage = myMessages[myMessages.length - 1];
  const lastMessageOverall = currentChatMessages[currentChatMessages.length - 1];
  const isReadByOther = lastMyMessage && lastMessageOverall && lastMessageOverall.sender_id !== currentUserId;

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
      <div className="bg-neutral-950 px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedBuddyChat(null)} className="p-1.5 text-neutral-400 hover:text-white rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="relative">
            <img src={selectedBuddyChat.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border border-neutral-800" />
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-neutral-950 ${buddyStatus.color}`} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white leading-tight">{selectedBuddyChat.username}</h3>
            <p className="text-[10px] text-neutral-400 font-medium">{buddyStatus.text}</p>
          </div>
        </div>

        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-neutral-400 hover:text-white rounded-xl font-bold">
            ⋮
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-xl z-50 py-1.5">
              <button onClick={() => { onDeleteConversation(); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-xs text-red-400 hover:bg-neutral-900 flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5" /> Supprimer la conv.
              </button>
              <button onClick={() => { onReportConversation(); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-xs text-neutral-300 hover:bg-neutral-900 flex items-center gap-2">
                <Flag className="w-3.5 h-3.5" /> Signaler
              </button>
            </div>
          )}
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-950/50">
        {currentChatMessages.length === 0 ? (
          <div className="text-center py-16 text-neutral-500 text-xs">
            Aucun message avec {selectedBuddyChat.username}. Envoie le premier ! 🚀
          </div>
        ) : (
          currentChatMessages.map((msg, index) => {
            const isMe = msg.sender_id === currentUserId;
            const isLastMyMsg = isMe && lastMyMessage && lastMyMessage.id === msg.id;

            return (
              <div key={msg.id || index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${isMe ? 'bg-orange-600 text-white rounded-br-xs shadow-md' : 'bg-neutral-900 text-neutral-100 border border-neutral-800 rounded-bl-xs'}`}>
                  {msg.text}
                </div>

                {/* Le "Vu" s'affiche uniquement si l'autre personne a répondu ou lu */}
                {isLastMyMsg && isReadByOther && (
                  <span className="text-[10px] text-neutral-400 mt-1 px-1 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-500" /> Vu
                  </span>
                )}
              </div>
            );
          })
        )}

        {/* Indicateur 3 petits points en direct (...) */}
        {remoteTyping && (
          <div className="flex items-start">
            <div className="bg-neutral-900 border border-neutral-800 px-4 py-2.5 rounded-2xl rounded-bl-xs text-xs text-neutral-400 flex items-center gap-1.5 shadow-md">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2">
        <input 
          type="text" 
          placeholder={`Écrire à ${selectedBuddyChat.username}...`} 
          value={currentMessageInput} 
          onChange={handleInputWithTyping}
          onKeyDown={(e) => { if (e.key === 'Enter') onSendMessage(); }}
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:border-orange-500" 
        />
        <button 
          onClick={onSendMessage} 
          className="p-3 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl transition shadow-md flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
