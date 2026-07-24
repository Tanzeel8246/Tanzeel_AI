import React, { useState } from 'react';

interface WebPreviewModalProps {
  htmlContent: string | null;
  onClose: () => void;
  onDownloadCode: (html: string) => void;
  isDarkMode: boolean;
}

export const WebPreviewModal: React.FC<WebPreviewModalProps> = ({
  htmlContent,
  onClose,
  onDownloadCode,
  isDarkMode
}) => {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);

  if (!htmlContent) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fullDoc = `<!DOCTYPE html>
<html lang="ur" dir="auto">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .urdu-text { font-family: 'Noto Nastaliq Urdu', serif; line-height: 2.2; }
  </style>
</head>
<body class="bg-gray-50 text-gray-900 min-h-screen">
  ${htmlContent}
</body>
</html>`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-6xl h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border transition-all ${
        isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-gray-200 text-slate-900'
      }`}>
        {/* Modal Toolbar */}
        <div className={`p-4 flex flex-wrap justify-between items-center gap-3 border-b ${
          isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm sm:text-base flex items-center gap-2">
              <i className="fas fa-desktop text-emerald-500"></i> Live Design Preview
            </span>

            {/* Toggle view mode */}
            <div className={`p-1 rounded-xl flex items-center border ${
              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-200 border-gray-300'
            }`}>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'preview' ? 'bg-emerald-600 text-white shadow' : 'opacity-70 hover:opacity-100'
                }`}
              >
                Visual Preview
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'code' ? 'bg-emerald-600 text-white shadow' : 'opacity-70 hover:opacity-100'
                }`}
              >
                HTML Code
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'code' && (
              <button
                onClick={handleCopyCode}
                className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <i className={`fas ${copied ? 'fa-check text-emerald-400' : 'fa-copy'}`}></i>
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            )}

            <button
              onClick={() => onDownloadCode(htmlContent)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5"
            >
              <i className="fas fa-download"></i>
              <span className="hidden sm:inline">Download HTML</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition-all"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>
        </div>

        {/* View Frame */}
        <div className="flex-1 bg-white relative overflow-hidden">
          {viewMode === 'preview' ? (
            <iframe
              title="Interactive Web Design Preview"
              srcDoc={fullDoc}
              className="w-full h-full border-none"
              sandbox="allow-scripts"
            />
          ) : (
            <div className="w-full h-full p-4 bg-slate-950 text-slate-100 font-mono text-xs overflow-auto leading-relaxed selection:bg-emerald-500 selection:text-white">
              <pre>{fullDoc}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
