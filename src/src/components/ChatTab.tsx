import React from 'react';
import { ArrowLeft, SendHorizontal, Trash2, Flag, CheckCheck, ShieldCheck, MessageCircle } from 'lucide-react';
import { RealUser, DBMessage } from '../types';

interface ChatTabProps {
  currentUserId?: string;
  selectedBuddyChat: RealUser | null;
  setSelectedBuddyChat: (u: RealUser | null) => void;
  activeChatUsers: RealUser[];
  currentChatMessages: DBMessage[];
  currentMessageInput: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: () => void;
  onSelectBuddy: (user: RealUser) => void;
  onDeleteConversation: (buddyId: string, buddyName: string) => void;
  onReportConversation: (buddyName: string) => void;
  isOtherUserTyping: boolean;
  isMessageLimitReached: boolean;
  lastReadTimestamps: Record<string, number>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

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
  isOtherUserTyping,
  isMessageLimitReached,
  lastReadTimestamps,
  messagesEndRef
}: ChatTabProps) {
  return (
    <div className="space-y-4">
      {selectedBuddyChat ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden flex flex-col h-[74vh]">
          <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedBuddyChat(null)} className="p-1.5 text-neutral-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                {selectedBuddyChat.username} {selectedBuddyChat.is_verified && <ShieldCheck className="w-4 h-4 text-orange-500 fill-orange-500/20" />}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => onReportConversation(selectedBuddyChat.username)} title="Signaler" className="p-2 text-amber-500 hover:text-amber-400 bg-amber-500/10 rounded-xl transition"><Flag className="w-4 h-4" /></button>
              <button onClick={() => onDeleteConversation(selectedBuddyChat.id, selectedBuddyChat.username)} title="Supprimer" className="p-2 text-neutral-500 hover:text-red-400 rounded-xl transition"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {currentChatMessages.map((msg, index, arr) => {
              const isMine = msg.sender_id === currentUserId;
              const friendLastRead = lastReadTimestamps[selectedBuddyChat.id] || 0;
              const isLastMyMessage = isMine && arr.slice(index + 1).every(m => m.sender_id === currentUserId);
              const isReadByFriend = isLastMyMessage && new Date(msg.created_at).getTime() <= friendLastRead;

              return (
                <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${isMine ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-neutral-200'}`}>
                    {msg.text}
                  </div>
                  {isLastMyMessage && (
                    <span className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-1">
                      {isReadByFriend ? (
                        <span className="text-blue-400 font-semibold flex items-center gap-0.5">
                          <CheckCheck className="w-3.5 h-3.5 text-blue-400" /> lu
                        </span>
                      ) : (
                        <span>envoyé</span>
                      )}
                    </span>
                  )}
                </div>
              );
            })}

            {isOtherUserTyping && (
              <div className="flex items-start">
                <div className="bg-neutral-800 px-4 py-3 rounded-2xl flex items-center gap-1.5 w-16">
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {selectedBuddyChat.id !== 'system-bot' && (
            <div className="p-3.5 bg-neutral-950 border-t border-neutral-800">
              {isMessageLimitReached ? (
                <div className="text-center py-2 text-xs text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  🔒 Limite de 3 messages atteinte. En attente d'acceptation.
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <input 
                    type="text" 
                    placeholder="Écrire un message..." 
                    value={currentMessageInput} 
                    onChange={onInputChange} 
                    onKeyDown={(e) => e.key === 'Enter' && onSendMessage()} 
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500" 
                  />
                  <button onClick={onSendMessage} className="p-3 bg-orange-600 text-white rounded-xl"><SendHorizontal className="w-4 h-4" /></button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black tracking-tight">Messagerie</h2>
              <span className="text-xs text-neutral-500">Conversations & Alertes 💬</span>
            </div>
            {activeChatUsers.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 text-sm">Aucun ami dans ton réseau. Va dans l'onglet **Buddy** pour ajouter des athlètes !</div>
            ) : (
              activeChatUsers.map((friend) => (
                <div 
                  key={friend.id} 
                  onClick={() => onSelectBuddy(friend)} 
                  className="p-4 bg-neutral-950 hover:bg-neutral-900/80 rounded-2xl border border-neutral-800 flex items-center justify-between cursor-pointer transition"
                >
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className="relative flex-shrink-0">
                      <img src={friend.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border border-neutral-800" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm truncate font-bold text-neutral-300">
                          {friend.username}
                        </h3>
                        {friend.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-orange-500 fill-orange-500/20 flex-shrink-0" />}
                      </div>
                      <p className="text-xs truncate mt-0.5 text-neutral-500">Clique pour ouvrir la discussion</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
