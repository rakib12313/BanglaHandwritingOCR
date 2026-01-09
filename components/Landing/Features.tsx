import React from 'react';
import { 
  ScanLine, 
  Languages, 
  ShieldCheck, 
  Zap, 
  FileOutput, 
  PenTool 
} from 'lucide-react';
import { Feature } from '../../types';

const features: Feature[] = [
  {
    title: "Native Bangla Recognition",
    description: "Trained on thousands of diverse handwriting samples to understand distinct styles and dialects of Bengali script.",
    icon: <Languages size={24} />,
  },
  {
    title: "High-Precision OCR",
    description: "Industry-leading accuracy for complex conjunct characters (Juktakkhors) and vintage manuscripts.",
    icon: <ScanLine size={24} />,
  },
  {
    title: "Smart Editor Workspace",
    description: "Correct, format, and annotate your digitized text immediately in a side-by-side comparative view.",
    icon: <PenTool size={24} />,
  },
  {
    title: "Enterprise Security",
    description: "Bank-grade encryption for your documents. Your data is processed securely and never trained upon without consent.",
    icon: <ShieldCheck size={24} />,
  },
  {
    title: "Instant Export",
    description: "Convert handwritten notes directly to searchable PDF, Microsoft Word, or plain text files in seconds.",
    icon: <FileOutput size={24} />,
  },
  {
    title: "Batch Processing",
    description: "Upload hundreds of pages at once. Our parallel processing engine handles bulk workloads effortlessly.",
    icon: <Zap size={24} />,
  }
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-white dark:bg-slate-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl mb-4">
            Powerful Features for Modern Archiving
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Everything you need to convert physical Bangla documents into digital assets without the headache of manual typing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-8 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-brand-200 dark:hover:border-brand-500/30 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-brand-600 dark:text-brand-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};