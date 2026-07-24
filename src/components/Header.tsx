import React from 'react';
import { TANZIL_AVATAR } from '@/constants';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenApiKeys: () => void;
  onOpenProfile: () => void;
  onToggleSidebar: () => void;
  activeKeyCount: number;
  avatarUrl: string;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleDarkMode,
  onOpenApiKeys,
  onOpenProfile,
  onToggleSidebar,
  activeKeyCount,
  avatarUrl
}) => {
  return (
    <nav className={`px-4 sm:px-6 py-3.5 sticky top-0 z-40 flex justify-between items-center border-b transition-colors duration-300 backdrop-blur-md ${
      isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-gray-200'
    }`}>
      {/* Left side: Hamburger + Profile trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className={`lg:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-gray-100 hover:bg-gray-200 text-slate-800'
          }`}
          aria-label="Toggle Sidebar"
        >
          <i className="fas fa-bars text-base"></i>
        </button>

        <div 
          onClick={onOpenProfile}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <img 
              src={avatarUrl || TANZIL_AVATAR} 
              alt="Tanzil-ur-Rehman" 
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-emerald-500/60 shadow-md object-cover group-hover:scale-105 transition-transform" 
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-tight group-hover:text-emerald-500 transition-colors flex items-center gap-1.5">
              <span>Tanzil-ur-Rehman</span>
              <span className="hidden md:inline-block text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                تنزیل الرحمن
              </span>
            </h1>
            <p className="text-[10px] sm:text-[11px] font-semibold text-emerald-500/90 tracking-wide truncate max-w-[180px] sm:max-w-none">
              App Developer • AI Expert • Web & Graphic
            </p>
          </div>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* API Keys Manager Button */}
        <button
          onClick={onOpenApiKeys}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
            isDarkMode 
              ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-200 hover:border-emerald-500/50' 
              : 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-slate-800 hover:border-emerald-500/50'
          }`}
          title="API Keys Manager"
        >
          <i className="fas fa-key text-emerald-500"></i>
          <span className="hidden sm:inline">API Keys</span>
          <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            {activeKeyCount}
          </span>
        </button>

        {/* Profile Bio Trigger */}
        <button
          onClick={onOpenProfile}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border hidden sm:flex items-center gap-1.5 ${
            isDarkMode ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-200' : 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-slate-800'
          }`}
        >
          <i className="fas fa-user text-emerald-500"></i>
          <span>Profile</span>
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={onToggleDarkMode}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            isDarkMode 
              ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700' 
              : 'bg-gray-100 hover:bg-gray-200 text-slate-800 border border-gray-200'
          }`}
          aria-label="Toggle Dark Mode"
        >
          <i className={`fas ${isDarkMode ? 'fa-sun text-amber-400' : 'fa-moon text-slate-700'}`}></i>
        </button>
      </div>
    </nav>
  );
};
