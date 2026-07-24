import React, { useState } from 'react';
import { Message } from '@/types';
import { TANZIL_AVATAR } from '@/constants';

interface ChatMessageProps {
  message: Message;
  isDarkMode: boolean;
  avatarUrl: string;
  onOpenPreview: (html: string) => void;
  onDownloadCode: (html: string) => void;
  onDownloadImage: (url: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isDarkMode,
  avatarUrl,
  onOpenPreview,
  onDownloadCode,
  onDownloadImage
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const isUser = message.role === 'user';
  const containsUrdu = /[\u0600-\u06FF]/.test(message.content);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(message.content);
      utterance.lang = containsUrdu ? 'ur-PK' : 'en-US';
      utterance.rate = 0.95;

      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`group relative max-w-[92%] sm:max-w-[80%] p-4 sm:p-5 rounded-2xl transition-all shadow-sm ${
        isUser 
          ? (isDarkMode ? 'bg-emerald-600 text-white rounded-tr-none shadow-emerald-950/20' : 'bg-slate-900 text-white rounded-tr-none shadow-slate-900/10')
          : (isDarkMode ? 'bg-slate-800 border border-slate-700/80 text-slate-100 rounded-tl-none shadow-slate-950/20' : 'bg-white border border-gray-200 text-slate-800 rounded-tl-none shadow-gray-200/50')
      }`}>
        {/* Header line */}
        <div className="flex justify-between items-center mb-3 opacity-70 text-[10px] uppercase tracking-wider font-semibold">
          <div className="flex items-center gap-2">
            <img 
              src={isUser ? "https://api.dicebear.com/7.x/avataaars/svg?seed=user" : (avatarUrl || TANZIL_AVATAR)} 
              className="w-5 h-5 rounded-full ring-1 ring-emerald-500/30 object-cover" 
              alt="avatar"
            />
            <span className="font-bold">{isUser ? 'Client' : 'Tanzil-ur-Rehman'}</span>
            {!isUser && message.usedKeyName && (
              <span className="hidden sm:inline-block bg-slate-700/50 px-1.5 py-0.2 rounded text-[9px] font-mono lowercase">
                key: {message.usedKeyName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Body Text */}
        <div className={`leading-relaxed text-sm whitespace-pre-wrap ${containsUrdu ? 'urdu-text text-base sm:text-lg' : ''}`}>
          {message.content}
        </div>

        {/* Generated Image if available */}
        {message.imageUrl && (
          <div className="mt-4 rounded-xl overflow-hidden border border-slate-700 group/img relative shadow-xl">
            <img 
              src={message.imageUrl} 
              alt="Generated Design" 
              className="w-full h-auto transform transition-transform group-hover/img:scale-102" 
            />
            <button 
              onClick={() => onDownloadImage(message.imageUrl!)}
              className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 text-white px-3 py-1.5 rounded-lg backdrop-blur-md text-xs font-bold transition-all flex items-center gap-2"
            >
              <i className="fas fa-download"></i> Download Image
            </button>
          </div>
        )}

        {/* Web Preview buttons if available */}
        {message.webPreview && (
          <div className="mt-4 pt-3 border-t border-slate-700/50 flex flex-wrap gap-2">
            <button 
              onClick={() => onOpenPreview(message.webPreview!)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <i className="fas fa-eye"></i> Live Web Preview
            </button>
            <button 
              onClick={() => onDownloadCode(message.webPreview!)}
              className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <i className="fas fa-download"></i> Download HTML Code
            </button>
          </div>
        )}

        {/* Message Action Toolbar (Copy & TTS) */}
        <div className="mt-3 pt-2 border-t border-slate-700/30 flex justify-end items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
          {'speechSynthesis' in window && (
            <button
              onClick={handleSpeak}
              className="p-1.5 rounded-lg hover:bg-slate-500/20 text-xs text-slate-300 transition-all flex items-center gap-1"
              title={isPlayingAudio ? "Stop Voice" : "Read Aloud"}
            >
              <i className={`fas ${isPlayingAudio ? 'fa-volume-xmark text-rose-400' : 'fa-volume-high text-emerald-400'}`}></i>
              <span className="text-[10px] hidden sm:inline">{isPlayingAudio ? 'Stop' : 'Listen'}</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-slate-500/20 text-xs text-slate-300 transition-all flex items-center gap-1"
            title="Copy Text"
          >
            <i className={`fas ${copied ? 'fa-check text-emerald-400' : 'fa-copy'}`}></i>
            <span className="text-[10px] hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
