import React from 'react';
import { motion } from 'framer-motion';

export default function GovBanner() {
  return (
    <div className="w-full bg-[#1e293b] text-slate-200 border-b border-slate-700/50">
      <div className="container mx-auto max-w-7xl px-4 py-1.5 flex flex-wrap justify-between items-center text-[10px] md:text-xs font-medium tracking-wide">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
            <span className="hidden sm:inline">🇮🇳</span>
            <span>भारत सरकार</span>
            <span className="opacity-50 mx-0.5">|</span>
            <span>Government of India</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4 opacity-80">
          <button className="hover:text-white transition-colors">Skip to main content</button>
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
