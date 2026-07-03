import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en.json';
import hiTranslation from './locales/hi.json';
import bnTranslation from './locales/bn.json';
import mrTranslation from './locales/mr.json';
import teTranslation from './locales/te.json';
import taTranslation from './locales/ta.json';
import guTranslation from './locales/gu.json';
import knTranslation from './locales/kn.json';

const resources = {
  en: { translation: enTranslation },
  hi: { translation: hiTranslation },
  bn: { translation: bnTranslation },
  mr: { translation: mrTranslation },
  te: { translation: teTranslation },
  ta: { translation: taTranslation },
  gu: { translation: guTranslation },
  kn: { translation: knTranslation },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safe from xss
    },
  });

export default i18n;
