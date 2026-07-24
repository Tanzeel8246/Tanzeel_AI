import React, { useState, useEffect, useRef } from 'react';
import { Header } from './src/components/Header';
import { Sidebar } from './src/components/Sidebar';
import { ChatMessage } from './src/components/ChatMessage';
import { ApiKeyModal } from './src/components/ApiKeyModal';
import { ProfileModal } from './src/components/ProfileModal';
import { WebPreviewModal } from './src/components/WebPreviewModal';
import { getGeminiResponse } from './services/geminiService';
import { ServiceMode, Message, UserStats, ApiKeyItem } from './types';
import { TANZIL_AVATAR } from './constants';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [mode, setMode] = useState<ServiceMode>(ServiceMode.CHAT);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  // Modals and Drawers
  const [isApiKeysOpen, setIsApiKeysOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // User Stats
  const [stats, setStats] = useState<UserStats>({
    graphicRequests: 0,
    webRequests: 0,
    lastReset: Date.now()
  });

  // Avatar Image state
  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    return localStorage.getItem('tanzil_avatar') || TANZIL_AVATAR;
  });

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(() => {
    const savedKeys = localStorage.getItem('tanzil_api_keys');
    let customKeys: ApiKeyItem[] = [];
    if (savedKeys) {
      try {
        customKeys = JSON.parse(savedKeys);
      } catch (e) {
        console.error("Failed parsing saved API keys", e);
      }
    }

    // Load Env Keys
    const envKeysList = [
      { name: 'Primary ENV Key (.env)', key: process.env.GEMINI_API_KEY || '' },
      { name: 'Secondary ENV Key 2', key: process.env.GEMINI_API_KEY_2 || '' },
      { name: 'Tertiary ENV Key 3', key: process.env.GEMINI_API_KEY_3 || '' }
    ].filter(k => k.key.trim().length > 0 && k.key !== 'PLACEHOLDER_API_KEY');

    const envItems: ApiKeyItem[] = envKeysList.map((envKey, idx) => ({
      id: `env-${idx}`,
      name: envKey.name,
      key: envKey.key,
      isEnvKey: true,
      isActive: idx === 0 && customKeys.length === 0,
      status: 'untested'
    }));

    // Combine custom keys and env keys
    const combined = [...customKeys];
    envItems.forEach(envItem => {
      if (!combined.some(c => c.key === envItem.key)) {
        combined.push(envItem);
      }
    });

    if (combined.length > 0 && !combined.some(k => k.isActive)) {
      combined[0].isActive = true;
    }

    return combined;
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Save Stats & Themes
  useEffect(() => {
    const savedStats = localStorage.getItem('tanzil_stats');
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        if (Date.now() - parsed.lastReset > 86400000) {
          setStats({ graphicRequests: 0, webRequests: 0, lastReset: Date.now() });
        } else {
          setStats(parsed);
        }
      } catch (e) {
        console.error("Failed parsing stats", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tanzil_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('tanzil_avatar', avatarUrl);
  }, [avatarUrl]);

  useEffect(() => {
    const customOnly = apiKeys.filter(k => !k.isEnvKey);
    localStorage.setItem('tanzil_api_keys', JSON.stringify(customOnly));
  }, [apiKeys]);

  useEffect(() => {
    document.body.className = isDarkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-[#fafafa] text-slate-900';
  }, [isDarkMode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Download handlers
  const handleDownloadImage = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `tanzil-design-${Date.now()}.png`;
    link.click();
  };

  const handleDownloadCode = (html: string) => {
    const fullDoc = `<!DOCTYPE html>
<html lang="ur" dir="auto">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tanzil Design Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .urdu-text { font-family: 'Noto Nastaliq Urdu', serif; line-height: 2.2; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

    const blob = new Blob([fullDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tanzil-web-design-${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // API Key handlers
  const handleAddApiKey = (name: string, key: string) => {
    const newKeyItem: ApiKeyItem = {
      id: `custom-${Date.now()}`,
      name,
      key,
      isEnvKey: false,
      isActive: apiKeys.length === 0,
      status: 'untested'
    };
    setApiKeys(prev => [...prev, newKeyItem]);
  };

  const handleRemoveApiKey = (id: string) => {
    setApiKeys(prev => {
      const filtered = prev.filter(k => k.id !== id);
      if (filtered.length > 0 && !filtered.some(k => k.isActive)) {
        filtered[0].isActive = true;
      }
      return filtered;
    });
  };

  const handleSelectActiveKey = (id: string) => {
    setApiKeys(prev => prev.map(k => ({ ...k, isActive: k.id === id })));
  };

  const handleUpdateKeyStatus = (id: string, status: 'valid' | 'invalid' | 'rate_limited') => {
    setApiKeys(prev => prev.map(k => k.id === id ? { ...k, status, lastTested: Date.now() } : k));
  };

  // Send Message Handler
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (mode === ServiceMode.GRAPHIC_DESIGN && stats.graphicRequests >= 2) {
      alert("روزانہ کی حد پوری ہو چکی ہے (2/2) - Graphic Design limit reached.");
      return;
    }
    if (mode === ServiceMode.WEB_DESIGN && stats.webRequests >= 2) {
      alert("روزانہ کی حد پوری ہو چکی ہے (2/2) - Web Design limit reached.");
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
      mode
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    const history = messages.slice(-10).map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    const response = await getGeminiResponse(currentInput, mode, history, apiKeys);

    if (response.keyStatusUpdate) {
      handleUpdateKeyStatus(response.keyStatusUpdate.keyId, response.keyStatusUpdate.status);
    }

    const modelMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: response.text,
      timestamp: Date.now(),
      mode,
      imageUrl: response.imageUrl,
      webPreview: response.webPreview,
      usedKeyName: response.usedKeyName
    };

    setMessages(prev => [...prev, modelMsg]);
    setIsLoading(false);

    if (mode === ServiceMode.GRAPHIC_DESIGN) setStats(s => ({ ...s, graphicRequests: s.graphicRequests + 1 }));
    if (mode === ServiceMode.WEB_DESIGN) setStats(s => ({ ...s, webRequests: s.webRequests + 1 }));
    setMode(ServiceMode.CHAT);
  };

  const activeKeyCount = apiKeys.filter(k => k.isActive || k.key.trim().length > 0).length;

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'dark bg-[#0f172a] text-slate-100' : 'bg-[#fafafa] text-slate-900'}`}>
      {/* Sidebar / Mobile Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        mode={mode}
        onSelectMode={(m) => setMode(m)}
        stats={stats}
        isDarkMode={isDarkMode}
        avatarUrl={avatarUrl}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenApiKeys={() => setIsApiKeysOpen(true)}
        apiKeys={apiKeys}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <Header
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onOpenApiKeys={() => setIsApiKeysOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          activeKeyCount={activeKeyCount}
          avatarUrl={avatarUrl}
        />

        {/* Chat Message Scroll Stream */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 scroll-smooth">
          <div className="max-w-4xl mx-auto w-full">
            {messages.length === 0 && (
              <div className="text-center py-12 sm:py-20 space-y-6 animate-fade-in max-w-xl mx-auto">
                <div className="relative inline-block">
                  <img 
                    src={avatarUrl || TANZIL_AVATAR} 
                    alt="Tanzil-ur-Rehman" 
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full mx-auto border-4 border-emerald-500/40 shadow-2xl object-cover" 
                  />
                  <div className="absolute bottom-1 right-1 bg-emerald-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs border-2 border-slate-900 font-bold shadow">
                    ✓
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight urdu-text text-emerald-500">
                    السلام علیکم ورحمۃ اللہ وبرکاتہ
                  </h2>
                  <h3 className="text-lg font-bold tracking-tight mt-1">
                    Tanzil-ur-Rehman Studio
                  </h3>
                  <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                    <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      📱 App Developer (ایپ ڈویلپر)
                    </span>
                    <span className="bg-purple-500/10 text-purple-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-purple-500/20">
                      🤖 AI Expert (اے آئی ایکسپرٹ)
                    </span>
                    <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-500/20">
                      🎨 Graphic & Web Designer
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm opacity-70 leading-relaxed font-medium max-w-md mx-auto">
                  Welcome to my official AI portal. Specializing in high-performance web/mobile app architecture, AI solutions, and Sharia-compliant creative designs.
                </p>

                {/* Quick Prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4">
                  <button
                    onClick={() => { setInput("السلام علیکم! مجھے ایک خوبصورت اسلامی ویب ایپ بنوانی ہے۔"); }}
                    className={`p-3 rounded-2xl border text-xs text-left transition-all hover:scale-101 ${
                      isDarkMode ? 'bg-slate-800/60 border-slate-700/80 hover:border-emerald-500 text-slate-200' : 'bg-white border-gray-200 hover:border-emerald-500 text-slate-800 shadow-xs'
                    }`}
                  >
                    <span className="block font-bold text-emerald-500">💻 Build Web Application</span>
                    <span className="text-[11px] opacity-70">Design a responsive Tailwind/React app mockup</span>
                  </button>

                  <button
                    onClick={() => { setInput("براہ کرم ایک شریعت کے مطابق ٹیکنالوجی کمپنی کا لوگو ڈیزائن ڈسکرائب کریں۔"); setMode(ServiceMode.GRAPHIC_DESIGN); }}
                    className={`p-3 rounded-2xl border text-xs text-left transition-all hover:scale-101 ${
                      isDarkMode ? 'bg-slate-800/60 border-slate-700/80 hover:border-purple-500 text-slate-200' : 'bg-white border-gray-200 hover:border-purple-500 text-slate-800 shadow-xs'
                    }`}
                  >
                    <span className="block font-bold text-purple-400">🎨 Sharia Graphic Design</span>
                    <span className="text-[11px] opacity-70">Strictly no living beings or immoral themes</span>
                  </button>
                </div>
              </div>
            )}

            {/* Message Stream */}
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isDarkMode={isDarkMode}
                avatarUrl={avatarUrl}
                onOpenPreview={(html) => setPreviewHtml(html)}
                onDownloadCode={handleDownloadCode}
                onDownloadImage={handleDownloadImage}
              />
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start my-4">
                <div className={`p-4 rounded-2xl flex items-center gap-3 border shadow-sm ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-gray-200 text-slate-800'
                }`}>
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  </div>
                  <span className="text-xs font-bold tracking-widest opacity-70 uppercase">Generating Response...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </main>

        {/* Input Dock Footer */}
        <footer className={`p-3 sm:p-5 transition-colors border-t sticky bottom-0 z-30 ${
          isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-gray-200 shadow-lg'
        }`}>
          <div className="max-w-4xl mx-auto space-y-3">
            {/* Mode selection chips */}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start items-center">
              <button 
                onClick={() => setMode(ServiceMode.CHAT)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                  mode === ServiceMode.CHAT 
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-md' 
                    : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-gray-100 border-gray-200 text-slate-700 hover:text-slate-900')
                }`}
              >
                <i className="fas fa-comment"></i> CHAT
              </button>

              <button 
                onClick={() => setMode(ServiceMode.GRAPHIC_DESIGN)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                  mode === ServiceMode.GRAPHIC_DESIGN 
                    ? 'bg-purple-600 border-purple-500 text-white shadow-md' 
                    : (isDarkMode ? 'bg-slate-800 border-slate-700 text-purple-400 hover:text-purple-300' : 'bg-gray-100 border-gray-200 text-purple-600 hover:text-purple-700')
                }`}
              >
                <i className="fas fa-palette"></i> GRAPHIC ({2 - stats.graphicRequests}/2)
              </button>

              <button 
                onClick={() => setMode(ServiceMode.WEB_DESIGN)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                  mode === ServiceMode.WEB_DESIGN 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md' 
                    : (isDarkMode ? 'bg-slate-800 border-slate-700 text-blue-400 hover:text-blue-300' : 'bg-gray-100 border-gray-200 text-blue-600 hover:text-blue-700')
                }`}
              >
                <i className="fas fa-code"></i> WEB ({2 - stats.webRequests}/2)
              </button>
            </div>

            {/* Input Box */}
            <div className="relative flex items-center">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { 
                  if(e.key === 'Enter' && !e.shiftKey) { 
                    e.preventDefault(); 
                    handleSend(); 
                  }
                }}
                placeholder={
                  mode === ServiceMode.CHAT 
                    ? "پیغام ٹائپ کریں... Type your query in Urdu or English..." 
                    : `Enter request for ${mode.replace('_', ' ')}...`
                }
                rows={1}
                className={`w-full p-3.5 pr-28 rounded-2xl resize-none min-h-[52px] max-h-32 transition-all border-2 outline-none text-sm leading-relaxed ${
                  isDarkMode 
                    ? 'bg-slate-800/80 border-slate-700 text-white focus:border-emerald-500' 
                    : 'bg-gray-50 border-gray-200 text-slate-900 focus:border-emerald-500'
                } ${input.match(/[\u0600-\u06FF]/) ? 'urdu-text' : ''}`}
              />

              <div className="absolute right-2.5 flex items-center gap-1.5">
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow flex items-center gap-2 ${
                    isDarkMode 
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-slate-800 disabled:text-slate-600' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-gray-200 disabled:text-gray-400'
                  }`}
                >
                  {isLoading ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <>
                      <span>ارسال</span>
                      <i className="fas fa-paper-plane"></i>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] opacity-50 px-1 font-semibold">
              <span>Tanzil-ur-Rehman Studio • Farooka</span>
              <span>Sharia-Compliant AI Core</span>
            </div>
          </div>
        </footer>
      </div>

      {/* API Keys Modal */}
      <ApiKeyModal
        isOpen={isApiKeysOpen}
        onClose={() => setIsApiKeysOpen(false)}
        apiKeys={apiKeys}
        onAddKey={handleAddApiKey}
        onRemoveKey={handleRemoveApiKey}
        onSelectActiveKey={handleSelectActiveKey}
        onUpdateKeyStatus={handleUpdateKeyStatus}
        isDarkMode={isDarkMode}
      />

      {/* Profile Bio Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        avatarUrl={avatarUrl}
        isDarkMode={isDarkMode}
      />

      {/* Web Preview Modal */}
      <WebPreviewModal
        htmlContent={previewHtml}
        onClose={() => setPreviewHtml(null)}
        onDownloadCode={handleDownloadCode}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default App;
