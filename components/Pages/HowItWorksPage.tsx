import React from 'react';
import { Navbar } from '../Layout/Navbar';
import { Footer } from '../Layout/Footer';
import { AppView } from '../../types';
import { Upload, Scan, FileText, Download, CheckCircle2 } from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
}

export const HowItWorksPage: React.FC<Props> = ({ onNavigate }) => {
  const steps = [
    {
      icon: <Upload size={32} />,
      title: "1. Ingestion & Pre-processing",
      desc: "When you upload an image or PDF, SEBON first normalizes the input. This involves binarization (converting to black & white), noise reduction (removing paper grain), and skew correction (straightening lines)."
    },
    {
      icon: <Scan size={32} />,
      title: "2. Segmentation & Line Detection",
      desc: "The AI breaks the page down into paragraphs, then lines, and finally individual words. For Bangla, the 'Matra' (headline) is used as a key anchor feature for segmentation."
    },
    {
      icon: <FileText size={32} />,
      title: "3. Neural Recognition",
      desc: "Each segmented word image is passed through our CRNN model. The model predicts the sequence of characters, handling complex conjuncts (juktakkhors) by analyzing context."
    },
    {
      icon: <CheckCircle2 size={32} />,
      title: "4. Language Model Verification",
      desc: "The raw text output is cross-referenced with a Bangla language model (LLM) to correct likely spelling errors and ensure grammatical consistency."
    },
    {
      icon: <Download size={32} />,
      title: "5. Re-assembly & Export",
      desc: "The text is reconstructed into the original document layout. You can then download it as a Microsoft Word document or a Searchable PDF."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-200">
      <Navbar onNavigate={onNavigate} currentView={AppView.HOW_IT_WORKS} />
      
      <div className="bg-slate-50 dark:bg-slate-800 pt-32 pb-12 text-center border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">How SEBON Works</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">The science behind the digitization</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

          <div className="space-y-16">
            {steps.map((step, index) => (
              <div key={index} className="relative flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0 z-10">
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 border-4 border-brand-100 dark:border-slate-600 text-brand-600 dark:text-brand-400 flex items-center justify-center shadow-sm">
                    {step.icon}
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{step.title}</h3>
                  <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};