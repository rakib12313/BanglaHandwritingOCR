import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  ArrowLeft, FileText, UploadCloud, Settings, Download, Search, 
  Copy, Type, Cloud, CheckCircle, RefreshCcw, AlertCircle, ScanText, Plus,
  ExternalLink
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
  
  // Auto-save state
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
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

  // Load content when active file changes
  useEffect(() => {
    if (activeFile) {
        const savedContent = localStorage.getItem(`sebon_autosave_${activeFile}`);
        // Only load if we are not currently processing a new file (which would set text via API)
        if (savedContent && !isProcessing) {
            setExtractedText(savedContent);
            // Try to recover timestamp if we stored it, or just use now
            setLastSaved(new Date()); 
        } else if (!isProcessing && !savedContent) {
            // If switching to a history file with no local storage, clear text
            setExtractedText("");
        }
        
        // Restore file name from history if available
        const fileRecord = historyFiles.find(f => f.id === activeFile);
        if (fileRecord) {
            setActiveFileName(fileRecord.name);
            if (fileRecord.url) setCloudUrl(fileRecord.url);
            // Note: We can't easily restore the previewUrl blob for history items without re-upload/storage
            // For this demo, we accept preview might be lost on refresh/nav unless using Cloudinary URL
            if (fileRecord.url) {
                // If it's a cloud URL, we can use it. Determine type by extension
                setPreviewUrl(fileRecord.url);
                setFileType(fileRecord.url.endsWith('.pdf') ? 'pdf' : 'image');
            } else {
                setPreviewUrl(null);
            }
        }
    }
  }, [activeFile]);

  // Auto-save logic
  useEffect(() => {
    if (!activeFile || isProcessing) return;

    // Indicate saving started
    setIsSaving(true);

    const timeoutId = setTimeout(() => {
      if (extractedText) {
          localStorage.setItem(`sebon_autosave_${activeFile}`, extractedText);
          setLastSaved(new Date());
      }
      setIsSaving(false);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [extractedText, activeFile, isProcessing]);


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

  // Helper to safely get the API key from various environment variable patterns
  const getApiKey = (): string | undefined => {
    const potentialKeys = [
      // 1. Vite (most likely for this project)
      // @ts-ignore
      (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_API_KEY : undefined,
      // @ts-ignore
      (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.API_KEY : undefined,
      
      // 2. Next.js / CRA / Node
      (typeof process !== 'undefined' && process.env) ? process.env.REACT_APP_API_KEY : undefined,
      (typeof process !== 'undefined' && process.env) ? process.env.NEXT_PUBLIC_API_KEY : undefined,
      (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined,
    ];

    // Return the first found key that isn't empty
    return potentialKeys.find(key => key && key.trim().length > 0);
  };

  const processFile = async (file: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Improved PDF detection: check MIME type OR file extension
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    setFileType(isPdf ? 'pdf' : 'image');
    
    const newFileId = `upload-${Date.now()}`;
    // Setting active file starts the "Load" effect, but isProcessing=true blocks it from overwriting
    setActiveFile(newFileId);
    setActiveFileName(file.name);
    setExtractedText(""); 
    setLastSaved(null);
    setError(null);
    setIsProcessing(true);

    try {
      // --- Environment Check Start ---
      const envKey = getApiKey();

      // Check if key exists
      if (!envKey) {
        throw new Error(
          "API Key not found. If using Vercel/Vite, rename your variable to 'VITE_API_KEY'. " + 
          "If using Next.js, use 'NEXT_PUBLIC_API_KEY'."
        );
      }

      // Trim whitespace to prevent "API key not valid" errors from copy-paste
      const cleanKey = envKey.trim();
      
      if (cleanKey.length === 0) {
        throw new Error("API Key is empty. Please check your environment variables.");
      }
      // --- Environment Check End ---

      // Start upload in parallel but await if needed or let it fail silently for OCR
      const uploadedUrlPromise = uploadToCloudinary(file);

      const ai = new GoogleGenAI({ apiKey: cleanKey });
      const base64Data = await fileToBase64(file);
      const prompt = "Transcribe the handwritten text with high precision. Detect Bengali script, English text, numbers, and math formulas. IMPORTANT: Output as clean, plain text only. Do NOT use Markdown formatting. Preserve line breaks.";

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ inlineData: { mimeType: isPdf ? 'application/pdf' : (file.type || 'image/png'), data: base64Data } }, { text: prompt }] }
      });

      // Await upload to get URL for history
      const uploadedUrl = await uploadedUrlPromise;

      if (response.text) {
        setExtractedText(response.text);
        // Save initial result immediately
        localStorage.setItem(`sebon_autosave_${newFileId}`, response.text);
        setLastSaved(new Date());
        
        setHistoryFiles(prev => [{ 
            id: newFileId, name: file.name, 
            date: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            url: uploadedUrl 
        }, ...prev]);
      } else {
        setExtractedText("No text detected.");
      }
    } catch (err: any) {
      console.error("OCR Processing Error:", err);
      let msg = err.message || "Unknown error";
<<<<<<< HEAD
      const lowerMsg = msg.toLowerCase();
      
      // Handle Leaked Key (403)
      if (lowerMsg.includes("leaked") || lowerMsg.includes("compromised")) {
         msg = "API Key Leaked: Google disabled this key for safety. Please generate a NEW key.";
      }
      // Handle Invalid Key / Permission Denied
      else if (lowerMsg.includes("api key not valid") || lowerMsg.includes("api_key_invalid") || lowerMsg.includes("permission_denied")) {
         msg = "Invalid API Key. Please verify the key in your .env file or Vercel Settings.";
      } 
      // Handle Missing Key (custom error)
      else if (lowerMsg.includes("api key not found")) {
         // Keep the custom error message we threw above
      } 
      // Handle generic process/env errors
      else if (lowerMsg.includes("process") || lowerMsg.includes("api_key")) {
=======
      
      // Handle the specific Google API error for invalid keys
      if (msg.includes("API key not valid") || msg.includes("API_KEY_INVALID")) {
         msg = "Invalid API Key. Please verify the key in your .env file or Vercel Settings.";
      } else if (msg.includes("API Key not found")) {
         // Keep the custom error message we threw above
      } else if (msg.includes("process") || msg.includes("API_KEY")) {
>>>>>>> 3e8b9ee32bb9b2717eafd15d611fe894b1d985ae
         msg += " (Check Environment Variables)";
      }
      
      setError(msg);
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
                 <iframe src={previewUrl} className="w-full h-full rounded shadow-lg border border-slate-200 bg-white" title="PDF Preview" /> :
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

               {error && (
                  <div className="absolute top-4 left-4 right-4 z-20 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-3 text-sm text-red-600 dark:text-red-400 shadow-md">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <AlertCircle size={18} className="flex-shrink-0" />
                        <span className="font-medium text-xs sm:text-sm break-all">{error}</span>
                      </div>
                      
<<<<<<< HEAD
                      {/* Check for generic "API Key" or "Leaked" message to show helper buttons */}
                      {(error.includes("API Key") || error.includes("Leaked")) && (
=======
                      {error.includes("API Key") && (
>>>>>>> 3e8b9ee32bb9b2717eafd15d611fe894b1d985ae
                         <div className="flex gap-2 mt-2 sm:mt-0 sm:ml-auto w-full sm:w-auto">
                            <a 
                              href="https://aistudio.google.com/app/apikey" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex-1 sm:flex-none justify-center flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-900 transition-colors whitespace-nowrap"
                            >
<<<<<<< HEAD
                              Get New Key <ExternalLink size={10} />
=======
                              Get API Key <ExternalLink size={10} />
>>>>>>> 3e8b9ee32bb9b2717eafd15d611fe894b1d985ae
                            </a>
                            <a 
                              href="https://vercel.com/docs/projects/environment-variables" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex-1 sm:flex-none justify-center flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-900 transition-colors whitespace-nowrap"
                            >
                              Setup Guide <ExternalLink size={10} />
                            </a>
                         </div>
                      )}
                  </div>
               )}
               
               <textarea 
                  className="flex-1 p-8 resize-none focus:outline-none text-lg leading-relaxed text-slate-800 dark:text-slate-200 dark:bg-slate-900 font-bangla"
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  placeholder="Extracted text will appear here..."
               />
               
               <div className="h-10 border-t border-slate-100 dark:border-slate-800 flex items-center px-4 text-xs text-slate-400 justify-between">
                  <span>{extractedText.length} characters</span>
                  <div className="flex items-center gap-3">
                      {isSaving ? (
                        <span className="flex items-center gap-1 text-slate-400"><RefreshCcw size={12} className="animate-spin"/> Saving...</span>
                      ) : lastSaved ? (
                        <span className="flex items-center gap-1 text-slate-400"><CheckCircle size={12} className="text-green-500"/> Saved {lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      ) : null}
                      {cloudUrl && <span className="flex items-center gap-1 text-green-600"><Cloud size={12}/> Synced to Cloud</span>}
                  </div>
               </div>
            </div>
         </div>
      </main>
    </div>
  );
};