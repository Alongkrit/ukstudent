'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import {
  MessageSquare,
  Search,
  Paperclip,
  Send,
  FileText,
  ShieldAlert,
  Loader2,
  Download,
} from 'lucide-react';
import ReportModal from '../components/ReportModal';

function formatDisplayName(person: any): string {
  if (!person) return 'Academic Tutor';
  const fullName = person.studentProfile?.fullName;
  if (fullName) return fullName;
  const namePart = (person.email || '').split('@')[0].replace(/[._]/g, ' ');
  return namePart
    .split(' ')
    .filter(Boolean)
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function ChatPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Fetch real conversations list on mount
  useEffect(() => {
    async function loadConversations() {
      try {
        const res = await apiFetch('/conversations');
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.data || [];
          setConversations(list);
          if (list.length > 0) {
            setActiveConvId(list[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoadingConversations(false);
      }
    }
    loadConversations();
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConvId) return;

    async function loadMessages() {
      setLoadingMessages(true);
      try {
        const res = await apiFetch(`/conversations/${activeConvId}/messages`);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.data || [];
          setMessages(list);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    }

    loadMessages();
  }, [activeConvId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConvId) return;

    const bodyText = inputMessage;
    setInputMessage('');

    try {
      const res = await apiFetch(`/conversations/${activeConvId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body: bodyText }),
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => [...prev, newMsg]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeConvId) return;

    setUploadingAttachment(true);
    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadRes = await apiFetch('/uploads', {
        method: 'POST',
        body: formData,
      });

      if (uploadRes.ok) {
        const uploaded = await uploadRes.json();
        const res = await apiFetch(`/conversations/${activeConvId}/messages`, {
          method: 'POST',
          body: JSON.stringify({
            body: `[Attached File: ${uploaded.fileName}]`,
            attachmentUrl: uploaded.fileUrl,
          }),
        });

        if (res.ok) {
          const newMsg = await res.json();
          setMessages((prev) => [...prev, newMsg]);
        }
      }
    } catch (err) {
      console.error('Failed to upload file in chat:', err);
    } finally {
      setUploadingAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const otherParty = formatDisplayName(user?.role === 'expert' ? activeConv?.student : activeConv?.expert);

  return (
    <div className="h-[calc(100vh-7rem)] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
      
      {/* Conversations Sidebar */}
      <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-sm text-primary-navy flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-accent-gold" />
              Chat Conversations
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
              Live
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-2 bg-white text-xs rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loadingConversations ? (
            <div className="p-6 text-center text-xs font-bold text-slate-400">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-xs font-medium text-slate-400">
              No active conversations yet. Match with a request to open live chat!
            </div>
          ) : (
              conversations.map((c) => {
              const partner = formatDisplayName(user?.role === 'expert' ? c.student : c.expert);
              const lastMsg = c.messages && c.messages[0] ? c.messages[0].body : 'Chat session opened';
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={`w-full text-left p-4 hover:bg-slate-100/80 transition-colors flex flex-col gap-1 ${
                    activeConvId === c.id ? 'bg-white border-l-4 border-primary-navy shadow-sm' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {partner || 'Academic Tutor'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-primary-blue line-clamp-1">{c.request?.title || 'Academic Support Session'}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{lastMsg}</p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Thread Window */}
      <div className="flex-1 flex flex-col bg-white">
        
        {/* Thread Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-navy text-accent-gold font-bold flex items-center justify-center text-xs shadow">
              {otherParty ? otherParty.charAt(0).toUpperCase() : 'EX'}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                {otherParty || 'Academic Tutor'}
              </h3>
              <p className="text-[10px] text-slate-500">{activeConv?.request?.title || 'Academic Support Session'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
            {activeConvId && (
              <button
                onClick={() => setShowReportModal(true)}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="Report Conversation"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
          {loadingMessages ? (
            <div className="p-8 text-center text-xs font-bold text-slate-400">Loading chat history...</div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center text-xs font-medium text-slate-400">
              No messages yet. Send a message to start the discussion!
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.senderId === user?.id;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1.5 shadow-sm ${
                      isMe
                        ? 'bg-primary-navy text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[10px] opacity-80">
                      <span className="font-bold">{isMe ? 'You' : formatDisplayName(m.sender)}</span>
                      <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {m.body && <p className="leading-relaxed">{m.body}</p>}
                    {m.attachmentUrl && (
                      <div className="pt-2">
                        <a
                          href={m.attachmentUrl.startsWith('http') ? m.attachmentUrl : `http://localhost:3001${m.attachmentUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-black/10 border border-white/10 flex items-center gap-2 text-[11px] hover:bg-black/20"
                        >
                          <FileText className="w-4 h-4 text-accent-gold" />
                          <span className="font-medium underline truncate">{m.attachmentUrl.split('/').pop()}</span>
                          <Download className="w-3.5 h-3.5 ml-auto" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Controls */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
        />

        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 flex items-center gap-2 bg-white">
          <button
            type="button"
            disabled={uploadingAttachment || !activeConvId}
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            title="Attach file"
          >
            {uploadingAttachment ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary-navy" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
          </button>
          <input
            type="text"
            placeholder="Type your message or academic question..."
            disabled={!activeConvId}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy"
          />
          <button
            type="submit"
            disabled={!activeConvId || !inputMessage.trim()}
            className="px-4 py-2.5 rounded-xl bg-primary-navy hover:bg-primary-blue text-white text-xs font-bold flex items-center gap-1 shadow disabled:opacity-50"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>

      {activeConvId && (
        <ReportModal
          conversationId={activeConvId}
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
        />
      )}

    </div>
  );
}
