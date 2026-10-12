'use client';

import React, { useState } from 'react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { X, MessageCircle, Send } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = '+91 8078611491';
  const cleanNumber = '918078611491';
  const defaultMessage = 'Hello Scholza, I would like to inquire about academic support.';
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <aside
      aria-label="WhatsApp Support"
      className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 flex flex-col items-end"
    >
      {/* Popover Mini Chat Card */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <WhatsAppIcon className="w-6 h-6 text-[#25D366]" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] rounded-full border-2 border-[#075E54]" />
              </div>
              <div>
                <h4 className="text-sm font-bold leading-tight">Scholza Support</h4>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span>Usually replies in minutes</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close WhatsApp chat popup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-slate-50 space-y-3 text-xs">
            <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm border border-slate-100 max-w-[90%] text-slate-700 space-y-1">
              <p className="font-semibold text-primary-navy">Hi there! 👋</p>
              <p>
                Need quick help with your assignment, dissertation, or exam preparation? Chat with our team directly on WhatsApp!
              </p>
              <span className="text-[10px] text-slate-400 block text-right">Online</span>
            </div>

            <div className="text-[11px] text-slate-500 text-center font-medium">
              Direct Contact: <span className="font-bold text-slate-700">{phoneNumber}</span>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-3 bg-white border-t border-slate-100">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all text-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Start Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <div className="flex items-center gap-2.5 group">
        {!isOpen && (
          <span className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-semibold shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Chat on WhatsApp
          </span>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close WhatsApp chat' : `Chat on WhatsApp at ${phoneNumber}`}
          title={`WhatsApp: ${phoneNumber}`}
          className="relative w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <>
              {/* Online Pulse Indicator */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#128C7E] border-2 border-white" />
              </span>
              <WhatsAppIcon className="w-7 h-7 text-white" />
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
