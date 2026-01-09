import React from 'react';
import { Navbar } from '../Layout/Navbar';
import { Footer } from '../Layout/Footer';
import { AppView } from '../../types';
import { 
  ScanLine, Languages, ShieldCheck, Zap, FileOutput, PenTool, 
  Cpu, FileSearch, Lock, Layers
} from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
}

export const FeaturesPage: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-200">
      <Navbar onNavigate={onNavigate} currentView={AppView.FEATURES} />
      
      {/* Header */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white pt-32 pb-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Technical Capabilities</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            SEBON isn't just an OCR; it's a deep-learning platform specifically architected for the complexities of the Bengali script.
          </p>
        </div>
      </div>

      {/* Deep Dive Section 1: Recognition */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800 text-brand-700 dark:text-brand-400 text-sm font-medium mb-6">
                <Cpu size={14} />
                <span>Core Engine</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                Mastering "Juktakkhor" (Conjuncts)
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                Unlike standard OCRs that struggle with Bengali conjunct characters (juktakkhors), SEBON utilizes a specialized Convolutional Recurrent Neural Network (CRNN) trained on over 2 million handwritten samples.
              </p>
              <ul className="space-y-4">
                {[
                  "Recognizes 350+ distinct conjunct combinations",
                  "Handles 'Matra' (top line) segmentation accurately",
                  "Adapts to varying stroke thickness and pen types",
                  "Context-aware character prediction using LSTM layers"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0">
                      <ScanLine size={12} />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-brand-100 dark:bg-brand-900/20 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
               <div className="relative z-10 space-y-4">
                  
                  {/* Examples List */}
                  <div className="space-y-3">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Input (Handwritten)</div>
                      <div className="font-bangla text-2xl text-slate-800 dark:text-slate-200">রক্তিম আকাশ</div>
                    </div>
                    
                    <div className="flex items-center gap-2 justify-center opacity-50">
                       <div className="h-4 w-0.5 bg-slate-300 dark:bg-slate-600"></div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                       <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Input (Complex Conjunct)</div>
                       <div className="font-bangla text-2xl text-slate-800 dark:text-slate-200">বিজ্ঞান ও প্রযুক্তি</div>
                    </div>

                    <div className="flex items-center gap-2 justify-center opacity-50">
                       <div className="h-4 w-0.5 bg-slate-300 dark:bg-slate-600"></div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                       <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Input (Cursive)</div>
                       <div className="font-bangla text-2xl text-slate-800 dark:text-slate-200">সোনার বাংলা</div>
                    </div>
                  </div>

                  <div className="flex justify-center py-2">
                    <Zap className="text-brand-500 animate-pulse" />
                  </div>
                  
                  <div className="bg-brand-50 dark:bg-brand-900/20 p-4 rounded-lg border border-brand-100 dark:border-brand-800">
                    <div className="text-sm text-brand-600 dark:text-brand-400 mb-2 font-semibold">Processed Output (Unicode)</div>
                    <div className="font-mono text-sm text-slate-900 dark:text-slate-300 bg-white dark:bg-slate-950 p-3 rounded border border-brand-200 dark:border-slate-700">
                      ["রক্তিম আকাশ", "বিজ্ঞান ও প্রযুক্তি", "সোনার বাংলা"]
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Enterprise Grade Features</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FileSearch size={32} />,
                title: "Layout Analysis",
                desc: "Automatically detects columns, tables, and image regions within a document page to preserve formatting."
              },
              {
                icon: <Lock size={32} />,
                title: "Secure Processing",
                desc: "Documents are processed in ephemeral containers. We are SOC2 compliant and employ AES-256 encryption."
              },
              {
                icon: <Languages size={32} />,
                title: "Dialect Support",
                desc: "Trained on handwriting from West Bengal and Bangladesh, handling subtle variations in character formation."
              },
              {
                icon: <Layers size={32} />,
                title: "Batch Operations",
                desc: "Upload 500+ pages at once. Our queue management system processes them in parallel for speed."
              },
              {
                icon: <PenTool size={32} />,
                title: "Rich Text Editor",
                desc: "Built-in editor supports Bangla spell-check and formatting before you export to Word."
              },
              {
                icon: <FileOutput size={32} />,
                title: "Multi-Format Export",
                desc: "Export to .docx, searchable .pdf, .txt, or JSON for developer integration."
              }
            ].map((f, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                <div className="text-brand-600 dark:text-brand-400 mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};