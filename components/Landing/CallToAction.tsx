import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '../UI/Button';

interface CTAProps {
  onStart: () => void;
}

export const CallToAction: React.FC<CTAProps> = ({ onStart }) => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-6">
          Ready to digitize your <br/>
          <span className="text-brand-600">Bangla documents?</span>
        </h2>
        
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          Join hundreds of students, researchers, and institutions using SEBON to save time and preserve history.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" onClick={onStart} className="min-w-[200px]">
            Get Started Now
          </Button>
          <Button variant="ghost" size="lg" className="gap-2">
            Contact Sales <ArrowRight size={18} />
          </Button>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          No credit card required for free tier • GDPR Compliant • 24/7 Support
        </p>
      </div>

      {/* Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-100 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
         <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-100 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
      </div>
    </section>
  );
};