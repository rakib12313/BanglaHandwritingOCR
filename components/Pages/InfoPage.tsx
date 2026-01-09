import React from 'react';
import { Navbar } from '../Layout/Navbar';
import { Footer } from '../Layout/Footer';
import { AppView } from '../../types';
import { Construction } from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
  title: string;
  subtitle: string;
  view: AppView;
  content?: React.ReactNode;
}

export const InfoPage: React.FC<Props> = ({ onNavigate, title, subtitle, view, content }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-200">
      <Navbar onNavigate={onNavigate} currentView={view} />
      
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">{title}</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {content ? (
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {content}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
               <Construction size={32} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Content Under Construction</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">This page is currently being updated for the v2.0 release.</p>
          </div>
        )}
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};