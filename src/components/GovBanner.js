import React from 'react';
import { useTranslation } from 'react-i18next';

export default function GovBanner() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language.startsWith('hi') ? 'en' : 'hi');
  };

  return (
    <div className="w-full bg-[#1e293b] text-slate-200 border-b border-slate-700/50">
      <div className="container mx-auto max-w-7xl px-4 py-1.5 flex flex-wrap justify-between items-center text-[10px] md:text-xs font-medium tracking-wide">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
            <span className="hidden sm:inline">🇮🇳</span>
            <span>{t('banner.india')}</span>
            <span className="opacity-50 mx-0.5">|</span>
            <span>{t('banner.india_en')}</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4 opacity-80">
          <button className="hover:text-white transition-colors">{t('banner.skip')}</button>
          <div className="flex items-center gap-2 border-l border-slate-600 pl-4 ml-2">
            <button 
              onClick={toggleLanguage}
              className="text-[10px] font-bold tracking-wider hover:text-white transition-colors uppercase bg-white/10 px-2 py-0.5 rounded"
            >
              {i18n.language.startsWith('hi') ? 'English' : 'हिन्दी'}
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-slate-700 transition-colors">A-</button>
            <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-slate-700 transition-colors">A</button>
            <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-slate-700 transition-colors">A+</button>
          </div>
        </div>
      </div>
    </div>
  );
}
