import React from 'react';
import { ServiceMode, UserStats, ApiKeyItem } from '@/types';
import { TANZIL_AVATAR } from '@/constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ServiceMode;
  onSelectMode: (mode: ServiceMode) => void;
  stats: UserStats;
  isDarkMode: boolean;
  avatarUrl: string;
  onOpenProfile: () => void;
  onOpenApiKeys: () => void;
  onOpenAdmin: () => void;
  apiKeys: ApiKeyItem[];
  memorySavedCount?: number;
  autoSaveMemory?: boolean;
  onToggleAutoSaveMemory?: () => void;
  onSaveMemory?: () => void;
  onClearMemory?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  mode,
  onSelectMode,
  stats,
  isDarkMode,
  avatarUrl,
  onOpenProfile,
  onOpenApiKeys,
  onOpenAdmin,
  apiKeys,
  memorySavedCount = 0,
  autoSaveMemory = true,
  onToggleAutoSaveMemory,
  onSaveMemory,
  onClearMemory
}) => {
  const activeKeyName = apiKeys.find(k => k.isActive)?.name || 'Default Env Key';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed lg:static top-0 left-0 z-50 h-full w-80 flex flex-col border-r transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-gray-200 text-slate-900'
      }`}>
        {/* Mobile Header in Drawer */}
        <div className="p-4 flex justify-between items-center lg:hidden border-b border-slate-800/40">
          <span className="font-bold text-sm uppercase tracking-wider text-emerald-500">Navigation Menu</span>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-500/20 text-slate-400"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Profile Info Card */}
        <div className="p-6 border-b border-slate-800/40 flex flex-col items-center text-center space-y-3">
          <div className="relative cursor-pointer group" onClick={onOpenProfile}>
            <img 
              src={avatarUrl || TANZIL_AVATAR} 
              alt="Tanzil-ur-Rehman" 
              className="w-20 h-20 rounded-2xl border-2 border-emerald-500/50 shadow-lg object-cover group-hover:scale-105 transition-transform" 
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] border-2 border-slate-900">
              <i className="fas fa-check"></i>
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold tracking-tight">Tanzil-ur-Rehman</h2>
            <p className="text-xs text-emerald-500 font-semibold mt-0.5">Farooka, Sargodha</p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-1">
            <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              📱 App Developer
            </span>
            <span className="bg-purple-500/10 text-purple-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-purple-500/20">
              🤖 AI Expert
            </span>
            <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-500/20">
              🎨 Graphic & Web Designer
            </span>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={onOpenProfile}
              className="text-xs text-emerald-500 hover:underline font-bold flex items-center gap-1"
            >
              <i className="fas fa-circle-info"></i> Full Bio
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={() => { onOpenAdmin(); onClose(); }}
              className="text-xs text-amber-500 hover:underline font-bold flex items-center gap-1"
            >
              <i className="fas fa-user-gear"></i> Admin Panel
            </button>
          </div>
        </div>


        {/* Navigation / Modes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider opacity-50 px-3">Service Modes (خدمات)</h3>
            <div className="space-y-1">
              <button
                onClick={() => { onSelectMode(ServiceMode.CHAT); onClose(); }}
                className={`w-full p-3 rounded-2xl text-left font-bold text-xs flex items-center justify-between transition-all ${
                  mode === ServiceMode.CHAT 
                    ? 'bg-emerald-600 text-white shadow-lg' 
                    : (isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-100 text-slate-700')
                }`}
              >
                <div className="flex items-center gap-3">
                  <i className="fas fa-comments text-base"></i>
                  <div>
                    <span className="block font-bold">General Assistant</span>
                    <span className="text-[10px] opacity-70 block font-normal">Urdu & English AI Chat</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => { onSelectMode(ServiceMode.GRAPHIC_DESIGN); onClose(); }}
                className={`w-full p-3 rounded-2xl text-left font-bold text-xs flex items-center justify-between transition-all ${
                  mode === ServiceMode.GRAPHIC_DESIGN 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : (isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-100 text-slate-700')
                }`}
              >
                <div className="flex items-center gap-3">
                  <i className="fas fa-palette text-base"></i>
                  <div>
                    <span className="block font-bold">Graphic Design</span>
                    <span className="text-[10px] opacity-70 block font-normal">Sharia Compliant (No living beings)</span>
                  </div>
                </div>
                <span className="bg-black/20 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {2 - stats.graphicRequests}/2 Left
                </span>
              </button>

              <button
                onClick={() => { onSelectMode(ServiceMode.WEB_DESIGN); onClose(); }}
                className={`w-full p-3 rounded-2xl text-left font-bold text-xs flex items-center justify-between transition-all ${
                  mode === ServiceMode.WEB_DESIGN 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : (isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-100 text-slate-700')
                }`}
              >
                <div className="flex items-center gap-3">
                  <i className="fas fa-code text-base"></i>
                  <div>
                    <span className="block font-bold">Web Application</span>
                    <span className="text-[10px] opacity-70 block font-normal">HTML & Tailwind Code Preview</span>
                  </div>
                </div>
                <span className="bg-black/20 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {2 - stats.webRequests}/2 Left
                </span>
              </button>
            </div>
          </div>

          {/* Memory Save & Chat Persistence Widget */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isDarkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-gray-200'
          }`}>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                <i className="fas fa-brain"></i> چاٹ میموری (Chat Memory)
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                {memorySavedCount} Messages
              </span>
            </div>

            <p className="text-[11px] opacity-75 leading-tight">
              آپ کی گفتگو اور ہدایات میموری میں محفوظ رہتی ہیں۔
            </p>

            <div className="flex items-center justify-between text-xs font-bold pt-1">
              <span className="flex items-center gap-1.5 text-slate-300">
                <i className={`fas fa-floppy-disk ${autoSaveMemory ? 'text-emerald-400' : 'text-slate-500'}`}></i>
                خودکار میموری سیو
              </span>
              <button
                type="button"
                onClick={onToggleAutoSaveMemory}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                  autoSaveMemory ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                  autoSaveMemory ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onSaveMemory}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-1.5 px-2 rounded-xl transition-all shadow flex items-center justify-center gap-1.5"
              >
                <i className="fas fa-download"></i>
                <span>میموری سیو کریں</span>
              </button>
              {onClearMemory && (
                <button
                  type="button"
                  onClick={onClearMemory}
                  title="Clear Saved Memory"
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs px-2.5 py-1.5 rounded-xl transition-all"
                >
                  <i className="fas fa-trash-can"></i>
                </button>
              )}
            </div>
          </div>

          {/* API Key Status Widget */}
          <div className={`p-4 rounded-2xl border space-y-2.5 ${
            isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                <i className="fas fa-shield-cat"></i> API Key Pool
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                {apiKeys.length} Keys
              </span>
            </div>
            <p className="text-xs font-mono truncate opacity-80">
              Active: {activeKeyName}
            </p>
            <button
              onClick={() => { onOpenAdmin(); onClose(); }}
              className="w-full bg-slate-700/60 hover:bg-slate-700 text-white text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-user-shield text-amber-400"></i> Manage Keys in Admin Panel
            </button>
          </div>

          {/* Sharia Compass */}
          <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
            isDarkMode ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-center gap-2 font-bold text-emerald-500">
              <i className="fas fa-mosque"></i>
              <span>Sharia Ethics Policy</span>
            </div>
            <p className="text-[11px] opacity-80 leading-relaxed">
              Strictly avoiding depictions of living beings (humans/animals), music, or un-Islamic concepts.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t text-center text-[10px] opacity-50 ${
          isDarkMode ? 'border-slate-800' : 'border-gray-200'
        }`}>
          © {new Date().getFullYear()} Tanzil-ur-Rehman • Farooka
        </div>
      </aside>
    </>
  );
};
