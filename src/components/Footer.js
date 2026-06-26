import React from 'react';
import { Link } from 'react-router-dom';
import { Vote } from 'lucide-react';

export default function Footer() {
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
              <span>SmartVote</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Secure, transparent digital voting for modern democracies. Your vote matters.
            </p>
          </div>

          {/* Platform Links */}
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold mb-1">Platform</h4>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link to="/elections" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Elections</Link>
            <Link to="/results" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Results</Link>
          </div>

          {/* Support Links */}
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold mb-1">Support</h4>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact Us</Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 mt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SmartVote. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">Secure · Transparent · Democratic</p>
        </div>
      </div>
    </footer>
  );
}
