/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, ShieldAlert, Send, ArrowLeft, ShieldCheck, Phone, Video, Flower, Info, Compass, Check, CheckCheck } from "lucide-react";
import { Match, Message, Profile } from "../types";
import { supabaseService } from "../supabaseService";

interface MessageInboxProps {
  matches: Match[];
  onRefresh: () => void;
  currentUserProfile: any;
}

export default function MessageInbox({ matches, onRefresh, currentUserProfile }: MessageInboxProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Poll for new messages (especially for local auto-replies)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (selectedMatch) {
      loadMessages();
      
      // Setup polling or event listener for replies
      const handleLocalUpdate = (e: any) => {
        if (e.detail?.matchId === selectedMatch.id) {
          loadMessages();
          onRefresh();
        }
      };
      
      window.addEventListener("local_messages_updated", handleLocalUpdate);
      
      interval = setInterval(() => {
        loadMessages();
      }, 4000);

      return () => {
        clearInterval(interval);
        window.removeEventListener("local_messages_updated", handleLocalUpdate);
      };
    }
  }, [selectedMatch]);

  const loadMessages = async () => {
    if (!selectedMatch) return;
    try {
      // Mark received messages as read
      await supabaseService.messages.markMessagesAsRead(selectedMatch.id);
      
      const msgs = await supabaseService.messages.getMessages(selectedMatch.id);
      setMessages(msgs);
      scrollToBottom();
    } catch (e) {
      console.error("Error loading messages", e);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch || !inputText.trim()) return;

    const currentText = inputText.trim();
    setInputText("");

    try {
      // Optimistic message append
      const optMsg: Message = {
        id: "msg_opt_" + Date.now(),
        match_id: selectedMatch.id,
        sender_id: currentUserProfile?.id || "current_user",
        receiver_id: selectedMatch.user_id,
        text: currentText,
        created_at: new Date().toISOString(),
        is_read: false, // Initially unread until recipient opens it
      };
      setMessages((prev) => [...prev, optMsg]);
      scrollToBottom();

      // Send via service
      await supabaseService.messages.sendMessage(
        selectedMatch.id,
        selectedMatch.user_id,
        currentText
      );

      // Reload real
      loadMessages();
      onRefresh();

      // Show typing indicator shortly after sending to simulate real Nairobi matchmaking agency
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        loadMessages();
      }, 2000);

    } catch (e) {
      console.error("Failed to send message", e);
    }
  };

  // Divide matches into "New Connections" (no messages) and "Conversations" (messaged)
  const newConnections = matches.filter(m => !m.last_message || m.last_message.startsWith("You connected!"));
  const activeChats = matches.filter(m => m.last_message && !m.last_message.startsWith("You connected!"));

  return (
    <div className="w-full max-w-md mx-auto h-[calc(100vh-130px)] flex flex-col bg-brand-obsidian">
      {!selectedMatch ? (
        <div className="flex-1 flex flex-col overflow-y-auto px-4 py-4 space-y-6">
          {/* Section: New Matches / Connections */}
          {newConnections.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-display font-semibold uppercase tracking-widest text-brand-gold">
                New Connections ({newConnections.length})
              </h4>
              <div className="flex gap-4 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
                {newConnections.map((match) => (
                  <button
                    key={match.id}
                    onClick={() => setSelectedMatch(match)}
                    className="flex flex-col items-center shrink-0 space-y-1.5 focus:outline-none group relative"
                  >
                    <div className="relative w-15 h-15 rounded-full p-[2px] bg-gradient-to-tr from-brand-gold to-brand-lavender">
                      <img
                        src={match.profile.images[0]}
                        alt={match.profile.name}
                        className="w-full h-full object-cover rounded-full border-2 border-brand-obsidian"
                        referrerPolicy="no-referrer"
                      />
                      {match.profile.is_verified && (
                        <span className="absolute bottom-0 right-0 bg-emerald-500 rounded-full border-2 border-brand-obsidian p-0.5">
                          <ShieldCheck className="w-3 h-3 text-white" />
                        </span>
                      )}
                      {match.unread_count > 0 && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-brand-obsidian animate-pulse" />
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-brand-cream/90 font-sans">
                      {match.profile.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: Active Chats */}
          <div className="flex-1 flex flex-col space-y-3">
            <h4 className="text-xs font-display font-semibold uppercase tracking-widest text-brand-gold">
              Conversations ({activeChats.length})
            </h4>

            {activeChats.length > 0 ? (
              <div className="space-y-1.5 flex-1">
                {activeChats.map((match) => (
                  <button
                    key={match.id}
                    onClick={() => setSelectedMatch(match)}
                    className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-brand-plum/50 border border-brand-lavender/30 hover:border-brand-gold/20 hover:bg-brand-plum/90 transition-all duration-300 text-left focus:outline-none"
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0 w-12 h-12">
                      <img
                        src={match.profile.images[0]}
                        alt={match.profile.name}
                        className="w-full h-full object-cover rounded-full"
                        referrerPolicy="no-referrer"
                      />
                      {match.profile.is_verified && (
                        <span className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full border-2 border-brand-obsidian p-0.5">
                          <ShieldCheck className="w-2.5 h-2.5 text-white" />
                        </span>
                      )}
                    </div>

                    {/* Chat description snippet */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="font-display font-semibold text-sm text-brand-cream tracking-tight">
                          {match.profile.name}
                        </span>
                        {match.last_message_time && (
                          <span className="text-[10px] text-brand-cream/40 font-mono">
                            {new Date(match.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-brand-cream/60 truncate pr-4 leading-relaxed">
                        {match.last_message}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {match.unread_count > 0 && (
                      <div className="shrink-0 bg-brand-gold text-brand-obsidian text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center">
                        {match.unread_count}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-brand-lavender/40 rounded-3xl min-h-[220px]">
                <MessageSquare className="w-10 h-10 text-brand-lavender/80 mb-3" />
                <h5 className="font-display font-medium text-brand-cream text-sm">No Active Chats</h5>
                <p className="text-xs text-brand-cream/50 max-w-xs mt-1.5 leading-relaxed">
                  Start swiping to find mutual matches! Once you connect, you can spark a discrete conversation here.
                </p>
              </div>
            )}
          </div>

          {/* Safe Dating Warning Notice */}
          <div className="bg-brand-lavender/20 border border-brand-lavender/40 rounded-2xl p-4 flex gap-3 text-xs text-brand-cream/80 leading-relaxed">
            <ShieldAlert className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-brand-gold block">Discreet & Safe Dating Tip:</span>
              <p>
                In Kenya, safety is essential. Meet matches only in popular, well-lit spaces (such as <strong>Alchemist Bar</strong>, <strong>Shamba Cafe</strong>, or registered business spots). Avoid sharing direct bank details. Always trust your gut!
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Section: Active Chat Conversation View */
        <div className="flex-1 flex flex-col bg-brand-obsidian h-full">
          {/* Chat Header */}
          <div className="px-4 py-3 border-b border-brand-lavender/40 bg-brand-plum/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedMatch(null);
                  onRefresh();
                }}
                className="p-1.5 rounded-xl hover:bg-brand-lavender/40 text-brand-cream/80 hover:text-brand-cream transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative shrink-0 w-10 h-10">
                <img
                  src={selectedMatch.profile.images[0]}
                  alt={selectedMatch.profile.name}
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
                {selectedMatch.profile.is_verified && (
                  <span className="absolute bottom-0 right-0 bg-emerald-500 rounded-full border border-brand-obsidian p-0.5">
                    <ShieldCheck className="w-2.5 h-2.5 text-white" />
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-display font-bold text-sm text-brand-cream tracking-tight flex items-center gap-1">
                  {selectedMatch.profile.name}
                </h4>
                <p className="text-[10px] text-brand-gold-muted leading-none font-sans font-medium mt-0.5">
                  {selectedMatch.profile.location_name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Micro Massage Jonny Book shortcut */}
              <div className="hidden xs:flex items-center gap-1 text-[10px] bg-brand-gold/10 border border-brand-gold/20 text-brand-gold font-medium px-2 py-1 rounded-full">
                <Flower className="w-3 h-3 text-brand-gold animate-bounce" />
                <span>Jonny Match</span>
              </div>
            </div>
          </div>

          {/* Messages Log area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {/* Disclaimer */}
            <div className="text-center py-2">
              <span className="text-[9px] font-mono tracking-widest text-brand-cream/40 uppercase bg-brand-plum/40 px-3 py-1.5 rounded-full border border-brand-lavender/20">
                Encrypted Connection
              </span>
            </div>

            {messages.map((msg) => {
              const isMe = msg.sender_id === (currentUserProfile?.id || "current_user");
              return (
                <div
                  key={msg.id}
                  className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? "bg-gradient-to-r from-brand-gold-muted to-brand-gold text-brand-obsidian rounded-br-none font-medium shadow-md"
                        : "bg-brand-plum border border-brand-lavender/40 text-brand-cream rounded-bl-none shadow-sm"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1.5">
                      <span className={`text-[8px] ${isMe ? "text-brand-obsidian/60" : "text-brand-cream/40"}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMe && (
                        <span className="flex items-center shrink-0">
                          {msg.is_read ? (
                            <span className="flex items-center gap-0.5 text-emerald-900/80 font-display text-[7px] font-bold uppercase tracking-wider">
                              <CheckCheck className="w-3 h-3 text-emerald-800 stroke-[3]" />
                              {msg.read_at ? "Seen" : "Read"}
                            </span>
                          ) : (
                            <Check className="w-3 h-3 text-brand-obsidian/45 stroke-[2.5]" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Simulated typing indicator */}
            {isTyping && (
              <div className="flex w-full justify-start">
                <div className="bg-brand-plum border border-brand-lavender/40 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input field area */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-brand-lavender/40 bg-brand-plum/80 flex gap-2 items-center"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Send a discreet message...`}
              className="flex-1 text-xs px-4 py-3 rounded-2xl bg-brand-obsidian border border-brand-lavender focus:outline-none focus:border-brand-gold text-brand-cream"
              id="chat-message-input"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-11 h-11 rounded-2xl bg-gradient-to-r from-brand-gold-muted to-brand-gold text-brand-obsidian flex items-center justify-center hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
              id="chat-send-btn"
            >
              <Send className="w-4.5 h-4.5 stroke-[2.5]" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
