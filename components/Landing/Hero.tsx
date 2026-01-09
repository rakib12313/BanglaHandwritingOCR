import React from 'react';
import { ArrowRight, FileText, Sparkles } from 'lucide-react';
import { Button } from '../UI/Button';

interface HeroProps {
  onStart: () => void;
  onViewDocs?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart, onViewDocs }) => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-50 via-slate-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950"></div>
      <div className="absolute top-0 right-0 -z-10 w-1/2 h-1/2 bg-gradient-to-b from-brand-100/40 to-transparent blur-3xl rounded-full dark:from-brand-900/20"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-8">
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            Transform <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">Bangla Handwriting</span> into Digital Text
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            The world's most accurate OCR engine for Bengali script. 
            Digitize manuscripts, lecture notes, and official forms securely with SEBON's AI-powered workspace.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={onStart} className="gap-2 shadow-xl shadow-brand-200/50 dark:shadow-none">
              Start OCR Free <ArrowRight size={18} />
            </Button>
            <Button variant="outline" size="lg" className="gap-2" onClick={onViewDocs}>
              View Documentation <FileText size={18} />
            </Button>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              99% Accuracy
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              Privacy First
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              Export to Word/PDF
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};