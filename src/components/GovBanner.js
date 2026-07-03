import React from 'react';
import { useTranslation } from 'react-i18next';

export default function GovBanner() {
  const { t, i18n } = useTranslation();


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
            <select
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              value={(i18n.language || 'en').split('-')[0]}
              className="text-[11px] font-bold tracking-wider hover:text-white transition-colors uppercase bg-[#1e293b] border-0 px-2 py-1 rounded cursor-pointer outline-none focus:ring-1 focus:ring-white/30 text-slate-200"
            >
              <option value="en" className="bg-[#1e293b]">English</option>
              <option value="hi" className="bg-[#1e293b]">हिन्दी (Hindi)</option>
              <option value="bn" className="bg-[#1e293b]">বাংলা (Bengali)</option>
              <option value="mr" className="bg-[#1e293b]">मराठी (Marathi)</option>
              <option value="te" className="bg-[#1e293b]">తెలుగు (Telugu)</option>
              <option value="ta" className="bg-[#1e293b]">தமிழ் (Tamil)</option>
              <option value="gu" className="bg-[#1e293b]">ગુજરાતી (Gujarati)</option>
              <option value="kn" className="bg-[#1e293b]">ಕನ್ನಡ (Kannada)</option>
            </select>
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
