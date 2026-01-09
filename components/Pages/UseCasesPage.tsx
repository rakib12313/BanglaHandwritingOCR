import React from 'react';
import { Navbar } from '../Layout/Navbar';
import { Footer } from '../Layout/Footer';
import { AppView } from '../../types';
import { Landmark, GraduationCap, Scale, Newspaper } from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
}

export const UseCasesPage: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-200">
      <Navbar onNavigate={onNavigate} currentView={AppView.USE_CASES} />
      
      <div className="pt-32 pb-16 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-4">Industries Transforming with SEBON</h1>
            <p className="text-xl text-slate-300">From historical archives to modern classrooms.</p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-24">
        
        {/* Government */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
           <div>
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg flex items-center justify-center mb-6">
                <Landmark size={24} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Land Records & Digitization (Khatiyan)</h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                Government land offices in West Bengal and Bangladesh hold millions of handwritten CS (Cadastral Survey) and RS (Revisional Survey) records.
              </p>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-400 space-y-2">
                <li>Extract owner names and plot numbers automatically.</li>
                <li>Create searchable databases from 100-year-old ledgers.</li>
                <li>Reduce citizen service time from weeks to minutes.</li>
              </ul>
           </div>
           <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl h-80 flex items-center justify-center border border-amber-100 dark:border-amber-900/20">
             <div className="text-center p-8 opacity-50">
               <span className="font-bangla text-6xl text-amber-900 dark:text-amber-200 block mb-4">খতিয়ান</span>
               <span className="text-sm text-slate-500 dark:text-slate-400">Land Record Archive Mockup</span>
             </div>
           </div>
        </div>

        {/* Academic */}
        <div className="grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
           <div className="order-2 md:order-1 bg-blue-50 dark:bg-blue-900/10 rounded-2xl h-80 flex items-center justify-center border border-blue-100 dark:border-blue-900/20">
             <div className="text-center p-8 opacity-50">
               <span className="font-bangla text-6xl text-blue-900 dark:text-blue-200 block mb-4">গবেষণা</span>
               <span className="text-sm text-slate-500 dark:text-slate-400">Research Paper Mockup</span>
             </div>
           </div>
           <div className="order-1 md:order-2">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg flex items-center justify-center mb-6">
                <GraduationCap size={24} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Historical Literature Research</h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                Researchers studying the works of Rabindranath Tagore, Nazrul Islam, or Bankim Chandra often deal with handwritten drafts.
              </p>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-400 space-y-2">
                <li>Convert scanned manuscripts into editable Unicode text.</li>
                <li>Perform keyword analysis on handwritten corpuses.</li>
                <li>Preserve decaying literary assets digitally.</li>
              </ul>
           </div>
        </div>

        {/* Legal */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
           <div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg flex items-center justify-center mb-6">
                <Scale size={24} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Legal & Judiciary</h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                Lawyers and clerks process countless handwritten petitions, FIRs, and witness statements daily.
              </p>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-400 space-y-2">
                <li>Digitize handwritten FIRs for police databases.</li>
                <li>Searchable index of past case notes.</li>
                <li>Secure handling of sensitive client data.</li>
              </ul>
           </div>
           <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl h-80 flex items-center justify-center border border-red-100 dark:border-red-900/20">
             <div className="text-center p-8 opacity-50">
               <span className="font-bangla text-6xl text-red-900 dark:text-red-200 block mb-4">আইন</span>
               <span className="text-sm text-slate-500 dark:text-slate-400">Legal Document Mockup</span>
             </div>
           </div>
        </div>

      </div>

      <Footer />
    </div>
  );
};