import React, { useState } from 'react';
import { ApiKeyItem } from '@/types';
import { testApiKey } from '@/services/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ApiKeyItem[];
  onAddKey: (name: string, key: string) => void;
  onRemoveKey: (id: string) => void;
  onSelectActiveKey: (id: string) => void;
  onUpdateKeyStatus: (id: string, status: 'valid' | 'invalid' | 'rate_limited') => void;
  isDarkMode: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKeys,
  onAddKey,
  onRemoveKey,
  onSelectActiveKey,
  onUpdateKeyStatus,
  isDarkMode
}) => {
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showPinPrompt, setShowPinPrompt] = useState(false);

  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [testingId, setTestingId] = useState<string | null>(null);
  const [showKeyValues, setShowKeyValues] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const ADMIN_PIN = "7860"; // Owner default admin PIN

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_PIN || pinInput.trim() === "786") {
      setIsAdminUnlocked(true);
      setShowPinPrompt(false);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  const handleAddKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminUnlocked) {
      setShowPinPrompt(true);
      return;
    }
    if (!newKeyValue.trim()) return;
    const name = newKeyName.trim() || `Key #${apiKeys.length + 1}`;
    onAddKey(name, newKeyValue.trim());
    setNewKeyName('');
    setNewKeyValue('');
  };

  const handleTestKey = async (item: ApiKeyItem) => {
    setTestingId(item.id);
    const result = await testApiKey(item.key);
    onUpdateKeyStatus(item.id, result);
    setTestingId(null);
  };

  const toggleShowKey = (id: string) => {
    if (!isAdminUnlocked) {
      setShowPinPrompt(true);
      return;
    }
    setShowKeyValues(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const maskKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return `${key.slice(0, 6)}••••••••${key.slice(-4)}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border transition-all ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-gray-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`p-5 flex justify-between items-center border-b ${
          isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-gray-100 bg-gray-50/50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-lg">
              <i className="fas fa-key"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg tracking-tight">API Keys Pool (اے پی آئی کیز مینیجر)</h3>
                {isAdminUnlocked ? (
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <i className="fas fa-lock-open text-[9px] mr-1"></i> Owner Unlocked
                  </span>
                ) : (
                  <span className="bg-slate-700/60 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-600">
                    <i className="fas fa-lock text-[9px] mr-1"></i> Public Read-Only
                  </span>
                )}
              </div>
              <p className="text-xs opacity-60">System Gemini API key routing & owner security portal</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-500/20 text-slate-400 hover:text-white transition-all"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Admin Unlock Prompt Banner / Dialog */}
          {showPinPrompt ? (
            <div className={`p-5 rounded-2xl border space-y-3 ${
              isDarkMode ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-emerald-50 border-emerald-300'
            }`}>
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                  <i className="fas fa-shield-halved"></i> Owner Passcode Required (ایڈمن کی تصدیق)
                </h4>
                <button 
                  onClick={() => setShowPinPrompt(false)}
                  className="text-xs opacity-60 hover:opacity-100"
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs opacity-90 leading-relaxed">
                اے پی آئی کیز میں تبدیلی یا نئی کی شامل کرنے کا اختیار صرف تنزیل الرحمن (Owner) کے پاس ہے۔ براہ کرم ایڈمن پاس کوڈ درج کریں۔
              </p>
              <form onSubmit={handleVerifyPin} className="flex gap-2">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => { setPinInput(e.target.value); setPinError(false); }}
                  placeholder="Enter Owner Passcode..."
                  className={`p-2.5 rounded-xl border text-xs font-mono outline-none flex-1 ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500' : 'bg-white border-gray-300 text-slate-900 focus:border-emerald-500'
                  }`}
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold"
                >
                  Unlock
                </button>
              </form>
              {pinError && (
                <p className="text-[11px] text-rose-400 font-bold">غلط پاس کوڈ! درست پاس کوڈ درج کریں۔</p>
              )}
            </div>
          ) : (
            /* Protected Security Notice */
            <div className={`p-4 rounded-2xl text-xs flex gap-3 border ${
              isDarkMode ? 'bg-slate-800/60 border-slate-700 text-slate-300' : 'bg-gray-100 border-gray-200 text-slate-700'
            }`}>
              <i className="fas fa-lock-keyhole text-emerald-500 text-lg mt-0.5"></i>
              <div className="space-y-1 flex-1">
                <p className="font-bold">محفوظ سسٹم کیز (Protected API Security)</p>
                <p className="opacity-90 leading-relaxed">
                  اے پی آئی کیز کا مینیجر تنزیل الرحمن کی طرف سے باحفاظت کنفیگرڈ ہے۔ تمام درخواستیں بیک اینڈ اینوائرنمنٹ کیز (<code className="bg-emerald-500/20 px-1 py-0.5 rounded font-mono">.env.local</code>) سے خودکار طر پر سنبھالی جاتی ہیں۔
                </p>
              </div>
              {!isAdminUnlocked && (
                <button
                  onClick={() => setShowPinPrompt(true)}
                  className="self-center bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border border-slate-600 whitespace-nowrap"
                >
                  <i className="fas fa-key text-amber-400 mr-1"></i> Admin Unlock
                </button>
              )}
            </div>
          )}

          {/* Key List Pool */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider opacity-60">
              Active System Keys Pool ({apiKeys.length})
            </h4>
            {apiKeys.length === 0 ? (
              <div className="p-8 text-center text-xs opacity-50 border border-dashed rounded-2xl">
                No custom API keys configured. Environment default keys will be used.
              </div>
            ) : (
              <div className="space-y-2">
                {apiKeys.map((item) => (
                  <div key={item.id} className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all ${
                    item.isActive 
                      ? (isDarkMode ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-emerald-50/60 border-emerald-300')
                      : (isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-gray-50 border-gray-200')
                  }`}>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          if (!isAdminUnlocked) {
                            setShowPinPrompt(true);
                            return;
                          }
                          onSelectActiveKey(item.id);
                        }}
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                          item.isActive 
                            ? 'bg-emerald-500 text-white' 
                            : 'border border-slate-500 text-transparent hover:border-emerald-500'
                        }`}
                        title={item.isActive ? "Active Key" : "Set as Active Key"}
                      >
                        <i className="fas fa-check text-[10px]"></i>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm truncate">{item.name}</span>
                          {item.isEnvKey && (
                            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                              🔒 .env File
                            </span>
                          )}
                          {item.isActive && (
                            <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-xs opacity-70">
                            {isAdminUnlocked && showKeyValues[item.id] ? item.key : maskKey(item.key)}
                          </span>
                          {isAdminUnlocked && (
                            <button 
                              type="button"
                              onClick={() => toggleShowKey(item.id)}
                              className="opacity-50 hover:opacity-100 text-[11px]"
                            >
                              <i className={`fas ${showKeyValues[item.id] ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-end">
                      {/* Status badge */}
                      {item.status === 'valid' && (
                        <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1">
                          <i className="fas fa-circle-check"></i> Valid
                        </span>
                      )}
                      {item.status === 'rate_limited' && (
                        <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1">
                          <i className="fas fa-triangle-exclamation"></i> Limited
                        </span>
                      )}
                      {item.status === 'invalid' && (
                        <span className="bg-rose-500/10 text-rose-500 text-[10px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1">
                          <i className="fas fa-circle-xmark"></i> Invalid
                        </span>
                      )}

                      {/* Test Button */}
                      <button
                        onClick={() => handleTestKey(item)}
                        disabled={testingId === item.id}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200' : 'bg-white border-gray-300 hover:bg-gray-100 text-slate-700'
                        }`}
                      >
                        {testingId === item.id ? (
                          <i className="fas fa-spinner fa-spin text-emerald-500"></i>
                        ) : (
                          <i className="fas fa-vial text-emerald-500"></i>
                        )}
                        <span>Test</span>
                      </button>

                      {isAdminUnlocked && !item.isEnvKey && (
                        <button
                          onClick={() => onRemoveKey(item.id)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-rose-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                          title="Remove Key"
                        >
                          <i className="fas fa-trash-can text-xs"></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Key Form (Unlocked for Owner) */}
          {isAdminUnlocked ? (
            <form onSubmit={handleAddKeySubmit} className={`p-4 rounded-2xl border space-y-3 ${
              isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-gray-50 border-gray-200'
            }`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                <i className="fas fa-plus-circle"></i> Add Custom API Key (نئی کی شامل کریں)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Key Name (e.g. Gemini Backup)"
                  className={`p-3 rounded-xl border text-xs outline-none transition-all ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 focus:border-emerald-500 text-white' : 'bg-white border-gray-200 focus:border-emerald-500 text-slate-900'
                  }`}
                />
                <input
                  type="password"
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  placeholder="AIzaSy..."
                  className={`p-3 rounded-xl border text-xs font-mono outline-none transition-all sm:col-span-2 ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 focus:border-emerald-500 text-white' : 'bg-white border-gray-200 focus:border-emerald-500 text-slate-900'
                  }`}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newKeyValue.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2"
                >
                  <i className="fas fa-key"></i> Save Key to Pool
                </button>
              </div>
            </form>
          ) : (
            <div className={`p-4 rounded-2xl border text-center text-xs space-y-2 ${
              isDarkMode ? 'bg-slate-800/20 border-slate-800 text-slate-400' : 'bg-gray-50 border-gray-200 text-slate-600'
            }`}>
              <i className="fas fa-lock text-slate-500 text-lg"></i>
              <p className="font-medium">پبلک کے لیے نئی کیز شامل کرنا الاؤ نہیں ہے۔ تمام ریکوئسٹس تنزیل الرحمن کی محفوظ سسٹم کیز سے چلتی ہیں۔</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex justify-between items-center text-xs opacity-70 ${
          isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-gray-100 bg-gray-50/50'
        }`}>
          <span>Automatic rotation active</span>
          <button 
            onClick={onClose}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
