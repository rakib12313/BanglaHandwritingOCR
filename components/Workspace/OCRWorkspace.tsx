import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  ArrowLeft, FileText, UploadCloud, Settings, Download, Search, 
  Copy, Type, Cloud, CheckCircle, RefreshCcw, AlertCircle, ScanText, Plus
} from 'lucide-react';
import { Button } from '../UI/Button';

interface OCRWorkspaceProps {
  onBack: () => void;
}

interface HistoryFile {
  id: string;
  name: string;
  date: string;
  url?: string;
}

export const OCRWorkspace: React.FC<OCRWorkspaceProps> = ({ onBack }) => {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [activeFileName, setActiveFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'pdf' | null>(null);
  const [cloudUrl, setCloudUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [historyFiles, setHistoryFiles] = useState<HistoryFile[]>(() => {
    try {
      const saved = localStorage.getItem('sebon_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('sebon_history', JSON.stringify(historyFiles));
  }, [historyFiles]);

  const uploadToCloudinary = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'OCR handwriting bangla');
    formData.append('cloud_name', 'da2sbo8ov');

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/da2sbo8ov/auto/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setCloudUrl(data.secure_url);
      return data.secure_url;
    } catch (err) { console.error('Cloudinary Error:', err); } 
    finally { setIsUploading(false); }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') resolve(reader.result.split(',')[1]);
        else reject(new Error("Failed to convert file"));
      };
      reader.onerror = reject;
    });
  };

  const processFile = async (file: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setFileType(file.type === 'application/pdf' ? 'pdf' : 'image');
    
    const newFileId = `upload-${Date.now()}`;
    setActiveFile(newFileId);
    setActiveFileName(file.name);
    setExtractedText("");
    setError(null);
    setIsProcessing(true);

    const uploadedUrl = await uploadToCloudinary(file);

    try {
      if (!process.env.API_KEY) throw new Error("API Key not found.");
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = await fileToBase64(file);
      const prompt = "Transcribe the handwritten text with high precision. Detect Bengali script, English text, numbers, and math formulas. IMPORTANT: Output as clean, plain text only. Do NOT use Markdown formatting. Preserve line breaks.";

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ inlineData: { mimeType: file.type, data: base64Data } }, { text: prompt }] }
      });

      if (response.text) {
        setExtractedText(response.text);
        setHistoryFiles(prev => [{ 
            id: newFileId, name: file.name, 
            date: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            url: uploadedUrl 
        }, ...prev]);
      } else {
        setExtractedText("No text detected.");
      }
    } catch (err: any) {
      setError("Failed to process document. " + (err.message || "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeFileName || 'document'}.txt`;
    link.click();
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />

      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20">
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg dark:text-slate-200 dark:hover:bg-slate-800"><ArrowLeft size={20}/></button>
            <span className="font-bold text-slate-800 dark:text-white">OCR Workspace</span>
         </div>
         <div className="p-4">
            <Button fullWidth onClick={() => fileInputRef.current?.click()}>
               <Plus size={18} className="mr-2"/> New Scan
            </Button>
         </div>
         <div className="flex-1 overflow-y-auto px-4 pb-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">History</h3>
            {historyFiles.map(file => (
               <div key={file.id} onClick={() => setActiveFile(file.id)} className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer mb-1 transition-colors ${activeFile === file.id ? 'bg-brand-50 border-brand-200 border' : 'hover:bg-slate-50 border border-transparent'}`}>
                  <FileText size={18} className="text-slate-400"/>
                  <div className="overflow-hidden">
                     <div className="text-sm font-medium truncate text-slate-700">{file.name}</div>
                     <div className="text-xs text-slate-400">{file.date}</div>
                  </div>
               </div>
            ))}
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
         {/* Toolbar */}
         <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6">
             <div className="flex items-center gap-2 text-sm text-slate-500">
                {activeFileName && <><span className="font-medium text-slate-900 dark:text-white">{activeFileName}</span> <span>•</span></>}
                <span>{isProcessing ? 'Processing...' : 'Ready'}</span>
             </div>
             <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(extractedText)}><Copy size={16} className="mr-2"/> Copy</Button>
                <Button variant="outline" size="sm" onClick={handleExport}><Download size={16} className="mr-2"/> Export TXT</Button>
             </div>
         </div>

         {/* Workspace Split */}
         <div className="flex-1 flex overflow-hidden">
            
            {/* Left: Preview */}
            <div className="w-1/2 bg-slate-100 dark:bg-slate-950 p-8 flex items-center justify-center relative border-r border-slate-200 dark:border-slate-800">
               {previewUrl ? (
                 fileType === 'pdf' ? 
                 <embed src={previewUrl} className="w-full h-full rounded shadow-lg border border-slate-200"/> :
                 <img src={previewUrl} className="max-w-full max-h-full object-contain shadow-lg rounded"/>
               ) : (
                 <div className="text-center text-slate-400">
                    <ScanText size={48} className="mx-auto mb-4 opacity-50"/>
                    <p>No document selected</p>
                 </div>
               )}
            </div>

            {/* Right: Editor */}
            <div className="w-1/2 bg-white dark:bg-slate-900 flex flex-col relative">
               {isProcessing ? (
                  <div className="absolute inset-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center flex-col">
                     <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                     <p className="text-brand-600 font-medium">Analyzing Handwriting...</p>
                  </div>
               ) : null}
               
               <textarea 
                  className="flex-1 p-8 resize-none focus:outline-none text-lg leading-relaxed text-slate-800 dark:text-slate-200 dark:bg-slate-900 font-bangla"
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  placeholder="Extracted text will appear here..."
               />
               
               <div className="h-10 border-t border-slate-100 dark:border-slate-800 flex items-center px-4 text-xs text-slate-400 justify-between">
                  <span>{extractedText.length} characters</span>
                  {cloudUrl && <span className="flex items-center gap-1 text-green-600"><Cloud size={12}/> Synced to Cloud</span>}
               </div>
            </div>
         </div>
      </main>
    </div>
  );
};