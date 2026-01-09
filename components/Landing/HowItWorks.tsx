import React from 'react';
import { Upload, Cpu, FileCheck, ArrowRight } from 'lucide-react';
import { Step } from '../../types';

const steps: Step[] = [
  {
    number: 1,
    title: "Upload Documents",
    description: "Drag & drop your scanned images or photos of handwritten Bangla text. Supports JPG, PNG, and PDF.",
    icon: <Upload size={28} />,
  },
  {
    number: 2,
    title: "AI Processing",
    description: "Our neural network analyzes layout, lines, and characters to extract text with context awareness.",
    icon: <Cpu size={28} />,
  },
  {
    number: 3,
    title: "Review & Export",
    description: "Edit the results in our smart workspace and export to your preferred format instantly.",
    icon: <FileCheck size={28} />,
  }
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 bg-slate-900 text-white overflow-hidden relative">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-indigo-500 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-brand-400 font-semibold tracking-wider uppercase text-sm">Workflow</span>
          <h2 className="text-3xl font-bold sm:text-4xl mt-2">
            From Paper to Pixel in Seconds
          </h2>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-slate-700 via-brand-500 to-slate-700 z-0"></div>

          {steps.map((step, index) => (
            <div key={index} className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 shadow-lg shadow-brand-900/20 group hover:border-brand-500 transition-colors duration-300">
                <div className="text-brand-400 group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm border-4 border-slate-900">
                  {step.number}
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-3 text-slate-100">{step.title}</h3>
              <p className="text-slate-400 leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
             <p className="text-slate-400 mb-6 text-sm">
                Optimized for handwritten manuscripts, letters, and forms.
             </p>
             <button className="text-brand-400 hover:text-brand-300 font-medium inline-flex items-center gap-2 group">
                See a live demo <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
             </button>
        </div>
      </div>
    </section>
  );
};