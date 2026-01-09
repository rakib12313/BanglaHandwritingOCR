import React from 'react';
import { ScanText, Github, Twitter, Linkedin } from 'lucide-react';
import { AppView } from '../../types';

interface FooterProps {
  onNavigate?: (view: AppView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (view: AppView) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) onNavigate(view);
  };

  return (
    <footer className="bg-slate-50 dark:bg-slate-900 pt-16 pb-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
                <ScanText size={20} />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">SEBON</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
              The advanced OCR solution specifically engineered for the Bengali language. Preserving heritage through technology.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"><Github size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li><button onClick={handleNav(AppView.FEATURES)} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Features</button></li>
              <li><button onClick={handleNav(AppView.PRICING)} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Pricing</button></li>
              <li><button onClick={handleNav(AppView.API_ACCESS)} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">API Access</button></li>
              <li><button onClick={handleNav(AppView.INTEGRATIONS)} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Integrations</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li><button onClick={handleNav(AppView.ABOUT_US)} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">About Us</button></li>
              <li><button onClick={handleNav(AppView.BLOG)} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Blog</button></li>
              <li><button onClick={handleNav(AppView.PRIVACY)} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Privacy Policy</button></li>
              <li><button onClick={handleNav(AppView.TERMS)} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Terms of Service</button></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500 dark:text-slate-400">
          &copy; {new Date().getFullYear()} SEBON Technologies. All rights reserved.
        </div>
      </div>
    </footer>
  );
};