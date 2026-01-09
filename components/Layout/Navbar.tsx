import React, { useState, useEffect } from 'react';
import { Menu, X, ScanText, ChevronRight, Moon, Sun, Presentation } from 'lucide-react';
import { Button } from '../UI/Button';
import { AppView } from '../../types';

interface NavbarProps {
  onNavigate: (view: AppView) => void;
  currentView: AppView;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView, isDarkMode, toggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', view: AppView.FEATURES },
    { label: 'How it Works', view: AppView.HOW_IT_WORKS },
    { label: 'Use Cases', view: AppView.USE_CASES },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent ${
        isScrolled || currentView !== AppView.LANDING ? 'glass-nav border-slate-200 dark:border-slate-800 py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => onNavigate(AppView.LANDING)}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-400 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <ScanText size={24} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">SEBON</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6">
              {navLinks.map((link) => (
                <button 
                  key={link.label}
                  onClick={() => onNavigate(link.view)}
                  className={`text-sm font-medium transition-colors ${
                    currentView === link.view 
                      ? 'text-brand-600 dark:text-brand-400 font-semibold' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
            
            {toggleTheme && (
              <button 
                onClick={toggleTheme}
                className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-full transition-colors"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => onNavigate(AppView.WHITEBOARD)} className="gap-2">
                <Presentation size={16} /> Whiteboard
              </Button>
              <Button size="sm" onClick={() => onNavigate(AppView.DASHBOARD)}>
                Launch Workspace
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
             {toggleTheme && (
              <button 
                onClick={toggleTheme}
                className="p-2 text-slate-500 dark:text-slate-400"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 md:hidden p-4 shadow-xl">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <button 
                key={link.label}
                onClick={() => {
                  onNavigate(link.view);
                  setIsMobileMenuOpen(false);
                }}
                className="text-left text-base font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 py-2 border-b border-slate-100 dark:border-slate-800"
              >
                {link.label}
              </button>
            ))}
            <Button fullWidth variant="outline" onClick={() => {
              setIsMobileMenuOpen(false);
              onNavigate(AppView.WHITEBOARD);
            }}>
               <Presentation size={16} className="mr-2" /> Whiteboard
            </Button>
            <Button fullWidth onClick={() => {
              setIsMobileMenuOpen(false);
              onNavigate(AppView.DASHBOARD);
            }}>
              Launch Workspace <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};