import React, { useRef } from 'react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarUrl: string;
  onUpdateAvatar?: (url: string) => void;
  isDarkMode: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  avatarUrl,
  onUpdateAvatar,
  isDarkMode
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result && onUpdateAvatar) {
          onUpdateAvatar(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border transition-all ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-gray-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`p-5 flex justify-between items-center border-b ${
          isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-gray-100 bg-gray-50/50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-lg">
              <i className="fas fa-id-card"></i>
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg tracking-tight">Official Profile (سرکاری پروفائل - تنزیل الرحمن)</h3>
              <p className="text-xs opacity-60">Verified Credentials & Bio • Tanzil-ur-Rehman Studio</p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Avatar Header Card */}
          <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden ${
            isDarkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-gray-200'
          }`}>
            <div className="relative group">
              <img 
                src={avatarUrl} 
                alt="Tanzil-ur-Rehman" 
                className="w-28 h-28 rounded-2xl border-4 border-emerald-500/50 shadow-xl object-cover"
              />
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs border-2 border-slate-900 shadow font-bold" title="Verified Profile">
                <i className="fas fa-check"></i>
              </div>
            </div>

            <div className="space-y-3 text-center sm:text-left flex-1">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-xl font-bold tracking-tight">Tanzil-ur-Rehman</h3>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    تنزیل الرحمن
                  </span>
                </div>
                <p className="text-xs text-emerald-500 font-semibold tracking-wide mt-0.5">Farooka, Sargodha (فروکہ، سرگودھا)</p>
              </div>

              {/* Verified Badge Badge (Photo upload is strictly restricted to Admin Panel) */}
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl w-fit mx-auto sm:mx-0">
                <i className="fas fa-user-shield text-amber-400"></i>
                <span>سرکاری اور تصدیق شدہ تصویر (Official Avatar)</span>
              </div>

              {/* Skills Badges */}
              <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1">
                  <i className="fas fa-mobile-screen"></i> App Developer (ایپ ڈویلپر)
                </span>
                <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1">
                  <i className="fas fa-robot"></i> AI Expert (اے آئی ایکسپرٹ)
                </span>
                <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1">
                  <i className="fas fa-palette"></i> Graphic & Web Designer
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Biography & Qualifications */}
          <div className="space-y-4 text-xs sm:text-sm">
            <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-500 mb-2 flex items-center gap-2">
                <i className="fas fa-graduation-cap"></i> Islamic Education & Honors (دینی تعلیم)
              </h4>
              <ul className="space-y-1.5 opacity-90 leading-relaxed list-disc list-inside">
                <li><strong className="text-emerald-400">Hifz-e-Quran (حفظ القرآن الكريم):</strong> Completed complete memorization of the Holy Quran with Tajweed.</li>
                <li><strong className="text-emerald-400">Dars-e-Nizami (درس نظامی):</strong> Traditional Islamic jurisprudence, Arabic grammar, Tafseer, and Hadith studies.</li>
                <li><strong className="text-emerald-400">Services:</strong> Teaching, Imamat, and Khitabat (تدریس، امامت و خطابت).</li>
              </ul>
            </div>

            <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className="font-bold text-xs uppercase tracking-wider text-purple-400 mb-2 flex items-center gap-2">
                <i className="fas fa-laptop-code"></i> Technology & AI Capabilities (تکنیکی صلاحیتیں)
              </h4>
              <ul className="space-y-1.5 opacity-90 leading-relaxed list-disc list-inside">
                <li><strong className="text-purple-300">App Development:</strong> Full-stack mobile and web applications (React, React Native, Vite, Node).</li>
                <li><strong className="text-purple-300">AI Engineering:</strong> Multi-LLM integration, Prompt Architecture, Gemini API workflows, Key management.</li>
                <li><strong className="text-purple-300">Sharia Graphic & Web Design:</strong> Pixel-perfect UI/UX, Elementor/WordPress, clean HTML/Tailwind, strictly adhering to Sharia moral guidelines.</li>
              </ul>
            </div>

            <div className={`p-4 rounded-2xl border text-xs flex gap-3 ${
              isDarkMode ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <i className="fas fa-scale-balanced text-emerald-500 text-lg mt-0.5"></i>
              <div>
                <strong className="block font-bold">Moral Principle & Sharia Ethics (شرعی اصول)</strong>
                <p className="mt-1 opacity-90 leading-relaxed">
                  Accountable to Allah Subhanahu wa Ta'ala. Prioritizing Islamic morals over profit. Strictly avoiding living beings in graphic designs, musical content, or anything contradicting Islamic values.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex justify-between items-center ${
          isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-gray-100 bg-gray-50/50'
        }`}>
          <span className="text-xs opacity-50 flex items-center gap-1">
            <i className="fas fa-circle-check text-emerald-500"></i> Verified Official Portal
          </span>
          <button 
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
