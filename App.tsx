import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Layout/Navbar';
import { Hero } from './components/Landing/Hero';
import { Features } from './components/Landing/Features';
import { HowItWorks } from './components/Landing/HowItWorks';
import { UseCases } from './components/Landing/UseCases';
import { Footer } from './components/Layout/Footer';
import { Workspace } from './components/Workspace/Workspace';
import { FeaturesPage } from './components/Pages/FeaturesPage';
import { HowItWorksPage } from './components/Pages/HowItWorksPage';
import { UseCasesPage } from './components/Pages/UseCasesPage';
import { InfoPage } from './components/Pages/InfoPage';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check system preference on load
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  // --- Router Logic ---

  if (currentView === AppView.DASHBOARD) {
    return <Workspace onBack={() => handleNavigate(AppView.LANDING)} isDarkMode={isDarkMode} toggleTheme={toggleTheme} initialMode="OCR" />;
  }

  if (currentView === AppView.WHITEBOARD) {
    return <Workspace onBack={() => handleNavigate(AppView.LANDING)} isDarkMode={isDarkMode} toggleTheme={toggleTheme} initialMode="WHITEBOARD" />;
  }

  if (currentView === AppView.FEATURES) {
    return <FeaturesPage onNavigate={handleNavigate} />;
  }

  if (currentView === AppView.HOW_IT_WORKS) {
    return <HowItWorksPage onNavigate={handleNavigate} />;
  }

  if (currentView === AppView.USE_CASES) {
    return <UseCasesPage onNavigate={handleNavigate} />;
  }

  // Generic Content Pages
  if (currentView === AppView.PRICING) {
    return <InfoPage onNavigate={handleNavigate} view={AppView.PRICING} title="Pricing Plans" subtitle="Flexible options for individuals and enterprises." />;
  }
  if (currentView === AppView.API_ACCESS) {
    return <InfoPage onNavigate={handleNavigate} view={AppView.API_ACCESS} title="Developer API" subtitle="Integrate SEBON's OCR engine into your own applications." />;
  }
  if (currentView === AppView.INTEGRATIONS) {
    return <InfoPage onNavigate={handleNavigate} view={AppView.INTEGRATIONS} title="Integrations" subtitle="Connect with Google Drive, Dropbox, and more." />;
  }
  if (currentView === AppView.ABOUT_US) {
    return <InfoPage onNavigate={handleNavigate} view={AppView.ABOUT_US} title="About Us" subtitle="Our mission to digitize Bengali heritage." />;
  }
  if (currentView === AppView.BLOG) {
    return <InfoPage onNavigate={handleNavigate} view={AppView.BLOG} title="SEBON Blog" subtitle="Latest updates, tutorials, and research." />;
  }
  if (currentView === AppView.PRIVACY) {
    return <InfoPage onNavigate={handleNavigate} view={AppView.PRIVACY} title="Privacy Policy" subtitle="How we handle your data with care." />;
  }
  if (currentView === AppView.TERMS) {
    return <InfoPage onNavigate={handleNavigate} view={AppView.TERMS} title="Terms of Service" subtitle="Usage guidelines and agreements." />;
  }

  // Default: Landing Page
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-200">
      <Navbar onNavigate={handleNavigate} currentView={currentView} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      
      <main>
        <Hero 
          onStart={() => handleNavigate(AppView.DASHBOARD)} 
          onViewDocs={() => handleNavigate(AppView.HOW_IT_WORKS)}
        />
        <Features />
        <HowItWorks />
        <UseCases />
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default App;