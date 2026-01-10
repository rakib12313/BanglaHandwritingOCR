import React from 'react';
import { GraduationCap, Library, Building2, ChevronRight } from 'lucide-react';
import { UseCase } from '../../types';

const cases: UseCase[] = [
  {
    role: "Academic & Research",
    title: "For Students & Historians",
    description: "Rapidly digitize lecture notes, historical manuscripts, and literature for thesis work without manual transcription.",
    icon: <GraduationCap size={32} />,
  },
  {
    role: "Government & Legal",
    title: "For Institutions",
    description: "Process thousands of handwritten forms, applications, and old registry records for digital archives.",
    icon: <Building2 size={32} />,
  },
  {
    role: "Archives & Museums",
    title: "For Digital Preservation",
    description: "Preserve cultural heritage by converting deteriorating paper documents into searchable digital formats.",
    icon: <Library size={32} />,
  }
];

export const UseCases: React.FC = () => {
  return (
    <section id="use-cases" className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              Built for those who value efficiency
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Whether you are a researcher preserving history or an organization digitizing records, SEBON adapts to your scale and needs.
            </p>
            
            <div className="space-y-6">
              {cases.map((item, index) => (
                <div key={index} className="flex gap-4 p-4 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all duration-300 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 cursor-default">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wide mb-1">
                      {item.role}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
             <div className="absolute inset-0 bg-gradient-to-tr from-brand-600 to-indigo-600 rounded-3xl transform rotate-3 scale-95 opacity-20 dark:opacity-40"></div>
             
             {/* Simplified Visual Representation instead of Card */}
             <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-100 dark:border-slate-700 w-full max-w-md">
                 <div className="text-center space-y-6 py-8">
                    <div className="inline-flex p-4 rounded-full bg-brand-50 dark:bg-slate-700 text-brand-600 dark:text-brand-400 mb-2">
                       <Library size={48} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Trusted by Professionals</h3>
                    <p className="text-slate-500 dark:text-slate-400">
                       Join 500+ researchers, archivists, and developers modernizing Bengali text processing.
                    </p>
                    <div className="flex justify-center -space-x-3 pt-4">
                        <img className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800" src="https://picsum.photos/100/100?random=1" alt="User" />
                        <img className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800" src="https://picsum.photos/100/100?random=2" alt="User" />
                        <img className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800" src="https://picsum.photos/100/100?random=3" alt="User" />
                        <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                           +500
                        </div>
                    </div>
                 </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};