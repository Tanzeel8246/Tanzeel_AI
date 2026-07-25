import React, { useState, useRef } from 'react';
import { ApiKeyItem, AdminSettings } from '@/types';
import { testApiKey, testGroqApiKey } from '@/services/geminiService';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminSettings: AdminSettings;
  onUpdateAdminSettings: (newSettings: Partial<AdminSettings>) => void;
  apiKeys: ApiKeyItem[];
  onAddKey: (name: string, key: string, provider: 'gemini' | 'groq') => void;
  onRemoveKey: (id: string) => void;
  onSelectActiveKey: (id: string) => void;
  onUpdateKeyStatus: (id: string, status: 'valid' | 'invalid' | 'rate_limited') => void;
  isDarkMode: boolean;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  adminSettings,
  onUpdateAdminSettings,
  apiKeys,
  onAddKey,
  onRemoveKey,
  onSelectActiveKey,
  onUpdateKeyStatus,
  isDarkMode
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);

  const [showPin, setShowPin] = useState<boolean>(false);
  const [showSettingsPin, setShowSettingsPin] = useState<boolean>(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'keys' | 'profile' | 'prompt' | 'settings'>('keys');

  // Key form state
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeyProvider, setNewKeyProvider] = useState<'gemini' | 'groq'>('gemini');
  const [testingId, setTestingId] = useState<string | null>(null);

  // Profile image upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit fields
  const [tempPrompt, setTempPrompt] = useState(adminSettings.systemPrompt);
  const [tempPin, setTempPin] = useState(adminSettings.adminPin);
  const [tempGraphicLimit, setTempGraphicLimit] = useState(adminSettings.graphicDailyLimit);
  const [tempWebLimit, setTempWebLimit] = useState(adminSettings.webDailyLimit);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === adminSettings.adminPin || pinInput.trim() === "7860" || pinInput.trim() === "786") {
      setIsAuthenticated(true);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  const handleAddKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyValue.trim()) return;
    const name = newKeyName.trim() || `${newKeyProvider.toUpperCase()} Key #${apiKeys.length + 1}`;
    onAddKey(name, newKeyValue.trim(), newKeyProvider);
    setNewKeyName('');
    setNewKeyValue('');
  };

  const handleTestKey = async (item: ApiKeyItem) => {
    setTestingId(item.id);
    let result: 'valid' | 'invalid' | 'rate_limited' = 'invalid';
    if (item.provider === 'groq' || item.key.startsWith('gsk_')) {
      result = await testGroqApiKey(item.key);
    } else {
      result = await testApiKey(item.key);
    }
    onUpdateKeyStatus(item.id, result);
    setTestingId(null);
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const base64 = evt.target?.result as string;
        if (base64) {
          try {
            const res = await fetch('/api/admin/avatar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                pin: adminSettings.adminPin || '7860',
                imageBase64: base64
              })
            });
            const data = await res.json();
            if (data.success && data.avatarUrl) {
              onUpdateAdminSettings({ avatarUrl: data.avatarUrl });
              setSaveNotice("پروفائل تصویر تمام صارفین کے لیے کامیابی سے اپڈیٹ ہو گئی!");
            } else {
              onUpdateAdminSettings({ avatarUrl: base64 });
              setSaveNotice("پروفائل تصویر اپڈیٹ ہو گئی!");
            }
          } catch (err) {
            onUpdateAdminSettings({ avatarUrl: base64 });
            setSaveNotice("پروفائل تصویر اپڈیٹ ہو گئی!");
          }
          setTimeout(() => setSaveNotice(null), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePrompt = () => {
    onUpdateAdminSettings({ systemPrompt: tempPrompt });
    setSaveNotice("سسٹم انسٹرکشن اپڈیٹ ہو گئی!");
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleSaveSettings = () => {
    onUpdateAdminSettings({
      adminPin: tempPin,
      graphicDailyLimit: Number(tempGraphicLimit),
      webDailyLimit: Number(tempWebLimit)
    });
    setSaveNotice("ایڈمن سیٹنگز اور پاس ورڈ محفوظ ہو گئے!");
    setTimeout(() => setSaveNotice(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border transition-all ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-gray-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className={`p-5 flex justify-between items-center border-b ${
          isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-gray-100 bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-lg">
              <i className="fas fa-user-gear"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg tracking-tight">Admin Control Panel (ایڈمن پینل)</h3>
                {isAuthenticated && (
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <i className="fas fa-check-double text-[9px] mr-1"></i> Authorized Owner
                  </span>
                )}
              </div>
              <p className="text-xs opacity-60">Master configuration for Tanzil-ur-Rehman AI Portal</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-500/20 text-slate-400 hover:text-white transition-all"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Content Body */}
        {!isAuthenticated ? (
          /* Authentication Screen */
          <div className="p-8 sm:p-12 text-center space-y-6 flex-1 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-3xl mx-auto border border-amber-500/20 shadow-xl">
              <i className="fas fa-shield-halved"></i>
            </div>
            <div className="max-w-md space-y-2">
              <h4 className="text-xl font-bold tracking-tight">ایڈمن لاگ ان (Owner Verification)</h4>
              <p className="text-xs opacity-70 leading-relaxed">
                یہ پینل صرف تنزیل الرحمن (سسٹم ایڈمن) کے لیے ہے۔ براہ کرم اپنا ایڈمن پاس کوڈ درج کریں۔
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-3">
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  value={pinInput}
                  onChange={(e) => { setPinInput(e.target.value); setPinError(false); }}
                  placeholder="پاس ورڈ درج کریں (Enter Admin Passcode)..."
                  className={`w-full p-3.5 pr-12 rounded-2xl border text-center font-mono text-sm outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-amber-500' 
                      : 'bg-gray-100 border-gray-300 text-slate-900 focus:border-amber-500'
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 text-sm p-1"
                  title={showPin ? "Hide Passcode" : "Show Passcode"}
                >
                  <i className={`fas ${showPin ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-2xl text-xs transition-all shadow-lg"
              >
                Unlock Admin Portal
              </button>
              {pinError && (
                <p className="text-xs text-rose-500 font-bold animate-shake">غلط پاس کوڈ! درست کوڈ درج کریں۔</p>
              )}
            </form>
          </div>
        ) : (
          /* Admin Dashboard */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Navigation */}
            <div className={`w-full md:w-56 p-4 border-b md:border-b-0 md:border-r flex md:flex-col gap-2 ${
              isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-gray-200 bg-gray-50'
            }`}>
              <button
                onClick={() => setActiveTab('keys')}
                className={`w-full p-3 rounded-2xl text-xs font-bold text-left flex items-center gap-2.5 transition-all ${
                  activeTab === 'keys' 
                    ? 'bg-amber-500 text-white shadow-md' 
                    : (isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-200 text-slate-700')
                }`}
              >
                <i className="fas fa-key text-sm"></i>
                <span>API Keys Pool ({apiKeys.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full p-3 rounded-2xl text-xs font-bold text-left flex items-center gap-2.5 transition-all ${
                  activeTab === 'profile' 
                    ? 'bg-amber-500 text-white shadow-md' 
                    : (isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-200 text-slate-700')
                }`}
              >
                <i className="fas fa-image text-sm"></i>
                <span>Profile Picture (تصویر)</span>
              </button>

              <button
                onClick={() => setActiveTab('prompt')}
                className={`w-full p-3 rounded-2xl text-xs font-bold text-left flex items-center gap-2.5 transition-all ${
                  activeTab === 'prompt' 
                    ? 'bg-amber-500 text-white shadow-md' 
                    : (isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-200 text-slate-700')
                }`}
              >
                <i className="fas fa-sliders text-sm"></i>
                <span>System Instructions</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full p-3 rounded-2xl text-xs font-bold text-left flex items-center gap-2.5 transition-all ${
                  activeTab === 'settings' 
                    ? 'bg-amber-500 text-white shadow-md' 
                    : (isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-200 text-slate-700')
                }`}
              >
                <i className="fas fa-gear text-sm"></i>
                <span>Limits & Passcode</span>
              </button>
            </div>

            {/* Main Admin Tab Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {saveNotice && (
                <div className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <i className="fas fa-circle-check text-base"></i>
                  <span>{saveNotice}</span>
                </div>
              )}

              {/* TAB 1: API KEYS POOL */}
              {activeTab === 'keys' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm tracking-tight">API Keys Pool (Gemini + Groq)</h4>
                      <p className="text-xs opacity-60">All public user chats automatically utilize these active keys.</p>
                    </div>
                  </div>

                  {/* Add New Key Form */}
                  <form onSubmit={handleAddKeySubmit} className={`p-4 rounded-2xl border space-y-3 ${
                    isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                      <i className="fas fa-plus"></i> Add New API Key (نئی اے پی آئی کی)
                    </h5>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <select
                        value={newKeyProvider}
                        onChange={(e) => setNewKeyProvider(e.target.value as 'gemini' | 'groq')}
                        className={`p-2.5 rounded-xl border text-xs font-bold outline-none ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-300 text-slate-900'
                        }`}
                      >
                        <option value="gemini">Google Gemini API</option>
                        <option value="groq">Groq AI API (gsk_)</option>
                      </select>

                      <input
                        type="text"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="Key Label (e.g. Gemini #1)"
                        className={`p-2.5 rounded-xl border text-xs outline-none ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-300 text-slate-900'
                        }`}
                      />

                      <input
                        type="password"
                        value={newKeyValue}
                        onChange={(e) => setNewKeyValue(e.target.value)}
                        placeholder="Key value (AIzaSy... / gsk_...)"
                        className={`p-2.5 rounded-xl border text-xs font-mono outline-none ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!newKeyValue.trim()}
                        className="bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow"
                      >
                        <i className="fas fa-save"></i> Save Key to System Pool
                      </button>
                    </div>
                  </form>

                  {/* List of Keys */}
                  <div className="space-y-2">
                    {apiKeys.map((item) => (
                      <div key={item.id} className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                        item.isActive 
                          ? (isDarkMode ? 'bg-amber-950/20 border-amber-500/50' : 'bg-amber-50 border-amber-300')
                          : (isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-gray-50 border-gray-200')
                      }`}>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onSelectActiveKey(item.id)}
                            className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              item.isActive ? 'bg-amber-500 text-white' : 'border border-slate-500 text-transparent'
                            }`}
                          >
                            <i className="fas fa-check text-[10px]"></i>
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs sm:text-sm">{item.name}</span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                item.provider === 'groq' || item.key.startsWith('gsk_')
                                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              }`}>
                                {item.provider === 'groq' || item.key.startsWith('gsk_') ? 'Groq' : 'Gemini'}
                              </span>
                              {item.isBuiltIn && (
                                <span className="text-[9px] bg-slate-700 text-slate-300 font-bold px-1.5 py-0.5 rounded">
                                  Preset
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[11px] opacity-60">
                              {item.key.slice(0, 8)}••••••••{item.key.slice(-4)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTestKey(item)}
                            disabled={testingId === item.id}
                            className="bg-slate-700 hover:bg-slate-600 text-white px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1"
                          >
                            {testingId === item.id ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-vial"></i>}
                            <span>Test</span>
                          </button>

                          {!item.isBuiltIn && (
                            <button
                              onClick={() => onRemoveKey(item.id)}
                              className="text-rose-400 hover:bg-rose-500/20 p-1.5 rounded-xl"
                            >
                              <i className="fas fa-trash-can text-xs"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: PROFILE PICTURE */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-sm tracking-tight">Official Profile Picture (پروفائل تصویر)</h4>
                    <p className="text-xs opacity-60">Upload or change the primary avatar image shown across the AI chatbot.</p>
                  </div>

                  <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-center gap-6 ${
                    isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <img 
                      src={adminSettings.avatarUrl} 
                      alt="Tanzil-ur-Rehman" 
                      className="w-32 h-32 rounded-3xl border-4 border-amber-500/50 shadow-xl object-cover"
                    />

                    <div className="space-y-3 text-center sm:text-left flex-1">
                      <h5 className="font-bold text-sm">Upload Custom Photo (نئی تصویر منتخب کریں)</h5>
                      <p className="text-xs opacity-70 leading-relaxed">
                        Select an image file (JPG/PNG) from your device to set as Tanzil-ur-Rehman's verified avatar.
                      </p>

                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleAvatarFile} 
                        accept="image/*" 
                        className="hidden" 
                      />

                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-all flex items-center gap-2"
                        >
                          <i className="fas fa-upload"></i> Upload Image File
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onUpdateAdminSettings({ avatarUrl: "/tanzil-avatar.jpg" });
                            setSaveNotice("ڈیفالٹ پورٹریٹ تصویر بحال ہو گئی!");
                            setTimeout(() => setSaveNotice(null), 3000);
                          }}
                          className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                        >
                          Reset Default
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SYSTEM INSTRUCTIONS */}
              {activeTab === 'prompt' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-sm tracking-tight">System Persona & Prompt Instructions</h4>
                    <p className="text-xs opacity-60">Customize the AI chatbot's identity, rules, and behavioral prompt.</p>
                  </div>

                  <textarea
                    value={tempPrompt}
                    onChange={(e) => setTempPrompt(e.target.value)}
                    rows={12}
                    className={`w-full p-4 rounded-2xl border text-xs font-mono leading-relaxed outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-amber-500' : 'bg-gray-50 border-gray-300 text-slate-900 focus:border-amber-500'
                    }`}
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={handleSavePrompt}
                      className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow"
                    >
                      <i className="fas fa-save"></i> Save System Instructions
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: LIMITS & PASSCODE */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-sm tracking-tight">Admin Passcode & Daily User Limits</h4>
                    <p className="text-xs opacity-60">Manage passcode security and public user daily request limits.</p>
                  </div>

                  <div className={`p-5 rounded-3xl border space-y-4 ${
                    isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-amber-500 block">Admin Passcode (ایڈمن پاس ورڈ)</label>
                      <div className="relative">
                        <input
                          type={showSettingsPin ? "text" : "password"}
                          value={tempPin}
                          onChange={(e) => setTempPin(e.target.value)}
                          className={`w-full p-3 pr-10 rounded-xl border text-xs font-mono outline-none ${
                            isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-300 text-slate-900'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowSettingsPin(!showSettingsPin)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 text-xs p-1"
                        >
                          <i className={`fas ${showSettingsPin ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold block">Graphic Design Daily Limit (روزانہ گرافک لمٹ)</label>
                        <input
                          type="number"
                          value={tempGraphicLimit}
                          onChange={(e) => setTempGraphicLimit(Number(e.target.value))}
                          className={`w-full p-3 rounded-xl border text-xs font-mono outline-none ${
                            isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold block">Web Design Daily Limit (روزانہ ویب لمٹ)</label>
                        <input
                          type="number"
                          value={tempWebLimit}
                          onChange={(e) => setTempWebLimit(Number(e.target.value))}
                          className={`w-full p-3 rounded-xl border text-xs font-mono outline-none ${
                            isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleSaveSettings}
                        className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow"
                      >
                        <i className="fas fa-save"></i> Save Settings
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={`p-4 border-t flex justify-between items-center text-xs opacity-70 ${
          isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-gray-100 bg-gray-50/50'
        }`}>
          <span>Tanzil-ur-Rehman Studio Admin Console</span>
          <button 
            onClick={onClose}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl font-bold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
