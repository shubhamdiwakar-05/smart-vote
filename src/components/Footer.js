import React from 'react';
import { Link } from 'react-router-dom';
import { Vote } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 font-bold text-lg">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Vote className="h-4 w-4" />
              </div>
              <span>e-Matdaan</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('footer.brand_desc')}
            </p>
          </div>

          {/* Platform Links */}
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold mb-1">{t('footer.platform')}</h4>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footer.about')}</Link>
            <Link to="/elections" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footer.elections')}</Link>
            <Link to="/results" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footer.results')}</Link>
          </div>

          {/* Support Links */}
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold mb-1">{t('footer.support')}</h4>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footer.contact')}</Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footer.privacy')}</Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footer.terms')}</Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 mt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {t('footer.rights', { year: new Date().getFullYear() })}
          </p>
          <p className="text-xs text-muted-foreground">{t('footer.tagline')}</p>
        </div>
      </div>
    </footer>
  );
}
