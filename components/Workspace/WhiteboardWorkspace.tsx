import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  MousePointer2, PenTool, Eraser, Minus, ArrowUpRight, Square, Circle, Grid3X3, 
  Trash2, Download, Copy, X, Type, Activity, Battery, Anchor, Zap, Triangle,
  Sparkles, Calculator, Bot, XCircle, Check, Wand2, Undo2, Redo2, Image as ImageIcon,
  Save, FolderOpen, Mouse
} from 'lucide-react';
import { Button } from '../UI/Button';

// Drawing Types
type ToolType = 
  'SELECT' | 'PEN' | 'ERASER' | 'LINE' | 'ARROW' | 'RECT' | 'CIRCLE' | 'TABLE' | 'TEXT' | 'IMAGE' |
  'AND' | 'OR' | 'NOT' | 
  'RESISTOR' | 'CAPACITOR' | 'INDUCTOR' | 'SOURCE' | 'DIODE';

interface DrawAction {
  id: string;
  type: ToolType;
  points: {x: number, y: number}[];
  color: string;
  width: number;
  rows?: number;
  cols?: number;
  text?: string;
  imageUrl?: string;
  imageSize?: { w: number, h: number };
}

interface SavedBoard {
    id: string;
    name: string;
    date: string;
    data: DrawAction[];
}

interface WhiteboardProps {
    onBack: () => void;
}

export const WhiteboardWorkspace: React.FC<WhiteboardProps> = ({ onBack }) => {
  const [tool, setTool] = useState<ToolType>('PEN');
  
  // History Management
  const [history, setHistory] = useState<DrawAction[][]>([[]]);
  const [historyStep, setHistoryStep] = useState(0);
  
  // Saved Pages
  const [savedBoards, setSavedBoards] = useState<SavedBoard[]>(() => {
    try {
        const saved = localStorage.getItem('sebon_whiteboard_saves');
        return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  const [showSavedList, setShowSavedList] = useState(false);

  useEffect(() => {
    localStorage.setItem('sebon_whiteboard_saves', JSON.stringify(savedBoards));
  }, [savedBoards]);

  // Computed drawings from history
  const drawings = history[historyStep] || [];

  const [currentDrawing, setCurrentDrawing] = useState<DrawAction | null>(null);
  const [strokeColor, setStrokeColor] = useState('#1e293b'); // slate-800
  const [strokeWidth, setStrokeWidth] = useState(2);
  
  // Selection
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);

  // Text Tool State
  const [isTyping, setIsTyping] = useState(false);
  const [typingPos, setTypingPos] = useState<{x: number, y: number} | null>(null);
  const [typingText, setTypingText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Image Cache (to prevent reloading images on every frame)
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [aiMode, setAiMode] = useState<'EXPLAIN' | 'MATH' | 'REALIZE' | null>(null);

  // Table Config
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- History Helpers ---
  const addToHistory = (newDrawings: DrawAction[]) => {
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push(newDrawings);
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
      if (historyStep > 0) {
          setHistoryStep(prev => prev - 1);
          setSelectedId(null);
      }
  };

  const redo = () => {
      if (historyStep < history.length - 1) {
          setHistoryStep(prev => prev + 1);
          setSelectedId(null);
      }
  };

  const saveBoard = () => {
      const name = prompt("Name this drawing:", `Board ${savedBoards.length + 1}`);
      if (!name) return;
      const newBoard: SavedBoard = {
          id: Date.now().toString(),
          name,
          date: new Date().toLocaleDateString(),
          data: drawings
      };
      setSavedBoards([newBoard, ...savedBoards]);
  };

  const loadBoard = (board: SavedBoard) => {
      if (confirm("Load saved board? Unsaved changes on current board will be lost.")) {
          setHistory([board.data]);
          setHistoryStep(0);
          setShowSavedList(false);
      }
  };

  const deleteBoard = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (confirm("Delete this saved board?")) {
          setSavedBoards(prev => prev.filter(b => b.id !== id));
      }
  };

  // Helper to calculate font size based on stroke width
  const getFontSize = (width: number) => {
      if (width <= 2) return 16;
      if (width <= 4) return 24;
      return 36;
  };

  // --- Rendering Logic ---
  
  const renderAction = (ctx: CanvasRenderingContext2D, action: DrawAction) => {
       const isSelected = action.id === selectedId;
       ctx.strokeStyle = isSelected ? '#3b82f6' : action.color;
       ctx.fillStyle = action.color;
       ctx.lineWidth = isSelected ? action.width + 2 : action.width;
       ctx.lineCap = 'round';
       ctx.lineJoin = 'round';
       
       if (isSelected && action.type !== 'TEXT' && action.type !== 'IMAGE') {
         ctx.setLineDash([5, 5]);
       } else {
         ctx.setLineDash([]);
       }

       ctx.beginPath();

       if (action.points.length === 0) return;

       const start = action.points[0];
       
       // --- Image Tool ---
       if (action.type === 'IMAGE' && action.imageUrl && action.imageSize) {
           const { w, h } = action.imageSize;
           
           let img = imageCache.current.get(action.id);
           if (!img) {
               img = new Image();
               img.src = action.imageUrl;
               imageCache.current.set(action.id, img);
           }

           if (img.complete) {
              ctx.drawImage(img, start.x, start.y, w, h);
           } else {
              ctx.fillStyle = '#e2e8f0';
              ctx.fillRect(start.x, start.y, w, h);
              ctx.fillStyle = '#64748b';
              ctx.fillText("Loading...", start.x + 10, start.y + 20);
           }

           if (isSelected) {
               ctx.strokeStyle = '#3b82f6';
               ctx.lineWidth = 2;
               ctx.setLineDash([5, 5]);
               ctx.strokeRect(start.x, start.y, w, h);
               ctx.setLineDash([]);
               ctx.fillStyle = '#3b82f6';
               ctx.fillRect(start.x + w - 5, start.y + h - 5, 10, 10);
           }
           return;
       }

       // --- Text Tool ---
       if (action.type === 'TEXT' && action.text) {
           const fontSize = getFontSize(action.width);
           ctx.font = `${fontSize}px sans-serif`;
           ctx.textBaseline = 'top';
           
           if (isSelected) {
               ctx.fillStyle = '#3b82f6';
               const lines = action.text.split('\n');
               let maxWidth = 0;
               lines.forEach(line => {
                   const m = ctx.measureText(line);
                   if (m.width > maxWidth) maxWidth = m.width;
               });
               const totalHeight = lines.length * (fontSize * 1.2);
               ctx.strokeStyle = '#3b82f6';
               ctx.setLineDash([5, 5]);
               ctx.strokeRect(start.x - 5, start.y - 5, maxWidth + 10, totalHeight + 10);
               ctx.setLineDash([]);
           } else {
               ctx.fillStyle = action.color;
           }

           const lines = action.text.split('\n');
           lines.forEach((line, i) => {
               ctx.fillText(line, start.x, start.y + (i * fontSize * 1.2));
           });
           return; // Text is filled, not stroked
       }

       const end = action.points[action.points.length - 1];

       // --- Basic Tools ---
       if (action.type === 'PEN' || action.type === 'ERASER') {
         if (action.type === 'ERASER') {
             ctx.strokeStyle = '#ffffff'; 
             ctx.lineWidth = 20;
         }
         ctx.moveTo(start.x, start.y);
         action.points.forEach(p => ctx.lineTo(p.x, p.y));
         ctx.stroke();
       } 
       else if (action.type === 'LINE') {
         ctx.moveTo(start.x, start.y);
         ctx.lineTo(end.x, end.y);
         ctx.stroke();
       } 
       else if (action.type === 'ARROW') {
         const headLen = 15;
         const angle = Math.atan2(end.y - start.y, end.x - start.x);
         ctx.moveTo(start.x, start.y);
         ctx.lineTo(end.x, end.y);
         ctx.lineTo(end.x - headLen * Math.cos(angle - Math.PI / 6), end.y - headLen * Math.sin(angle - Math.PI / 6));
         ctx.moveTo(end.x, end.y);
         ctx.lineTo(end.x - headLen * Math.cos(angle + Math.PI / 6), end.y - headLen * Math.sin(angle + Math.PI / 6));
         ctx.stroke();
       } 
       else if (action.type === 'RECT') {
         ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
       } 
       else if (action.type === 'CIRCLE') {
         const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
         ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
         ctx.stroke();
       } 
       else if (action.type === 'TABLE') {
         const w = end.x - start.x;
         const h = end.y - start.y;
         ctx.strokeRect(start.x, start.y, w, h);
         const r = action.rows || 3;
         const c = action.cols || 3;
         ctx.beginPath();
         for(let i=1; i<c; i++) {
            const x = start.x + (w * i / c);
            ctx.moveTo(x, start.y); ctx.lineTo(x, end.y);
         }
         for(let i=1; i<r; i++) {
            const y = start.y + (h * i / r);
            ctx.moveTo(start.x, y); ctx.lineTo(end.x, y);
         }
         ctx.stroke();
       }
       // --- Engineering Tools ---
       else if (['RESISTOR', 'CAPACITOR', 'INDUCTOR', 'SOURCE', 'DIODE', 'AND', 'OR', 'NOT'].includes(action.type)) {
         const w = end.x - start.x;
         const h = end.y - start.y;
         const cx = start.x + w/2;
         const cy = start.y + h/2;
         const size = Math.max(Math.abs(w), Math.abs(h));
         
         ctx.save();
         
         // Scaling logic
         if (size < 10) {
            ctx.translate(end.x, end.y);
         } else {
            ctx.translate(cx, cy);
            const scale = Math.max(0.5, size / 40); 
            ctx.scale(scale, scale);
         }

         // Normalize line width when scaled
         ctx.lineWidth = 2; 

         if (action.type === 'RESISTOR') {
            ctx.beginPath();
            ctx.moveTo(-20, 0); ctx.lineTo(-10, 0);
            ctx.lineTo(-7, -5); ctx.lineTo(-3, 5); ctx.lineTo(1, -5); ctx.lineTo(5, 5); ctx.lineTo(9, -5); ctx.lineTo(10, 0);
            ctx.lineTo(20, 0);
            ctx.stroke();
         }
         else if (action.type === 'CAPACITOR') {
            ctx.beginPath();
            ctx.moveTo(-20, 0); ctx.lineTo(-5, 0);
            ctx.moveTo(-5, -15); ctx.lineTo(-5, 15);
            ctx.moveTo(5, -15); ctx.lineTo(5, 15);
            ctx.moveTo(5, 0); ctx.lineTo(20, 0);
            ctx.stroke();
         }
         else if (action.type === 'INDUCTOR') {
             ctx.beginPath();
             ctx.moveTo(-20, 0);
             ctx.arc(-10, 0, 5, Math.PI, 0);
             ctx.arc(0, 0, 5, Math.PI, 0);
             ctx.arc(10, 0, 5, Math.PI, 0);
             ctx.lineTo(20, 0);
             ctx.stroke();
         }
         else if (action.type === 'SOURCE') {
             ctx.beginPath();
             ctx.arc(0, 0, 15, 0, Math.PI*2);
             ctx.moveTo(0, -15); ctx.lineTo(0, -25);
             ctx.moveTo(0, 15); ctx.lineTo(0, 25);
             // +/-
             ctx.moveTo(-5, -5); ctx.lineTo(5, -5); ctx.moveTo(0, -10); ctx.lineTo(0, 0); // +
             ctx.moveTo(-5, 5); ctx.lineTo(5, 5); // -
             ctx.stroke();
         }
         else if (action.type === 'DIODE') {
             ctx.beginPath();
             ctx.moveTo(-20, 0); ctx.lineTo(-10, 0);
             ctx.moveTo(-10, -10); ctx.lineTo(-10, 10); ctx.lineTo(10, 0); ctx.closePath();
             ctx.moveTo(10, -10); ctx.lineTo(10, 10);
             ctx.moveTo(10, 0); ctx.lineTo(20, 0);
             ctx.stroke();
         }
         else if (action.type === 'AND') {
           ctx.beginPath();
           ctx.moveTo(-20, -20); ctx.lineTo(0, -20);
           ctx.arc(0, 0, 20, -Math.PI/2, Math.PI/2);
           ctx.lineTo(-20, 20); ctx.lineTo(-20, -20);
           ctx.moveTo(20, 0); ctx.lineTo(30, 0); // output
           ctx.moveTo(-20, -10); ctx.lineTo(-30, -10); // input A
           ctx.moveTo(-20, 10); ctx.lineTo(-30, 10); // input B
           ctx.stroke();
         } 
         else if (action.type === 'OR') {
           ctx.beginPath();
           ctx.moveTo(-20, -20); 
           ctx.quadraticCurveTo(0, -20, 20, 0);
           ctx.quadraticCurveTo(0, 20, -20, 20);
           ctx.quadraticCurveTo(-10, 0, -20, -20);
           ctx.stroke();
           ctx.beginPath();
           ctx.moveTo(20, 0); ctx.lineTo(30, 0);
           ctx.moveTo(-15, -10); ctx.lineTo(-30, -10);
           ctx.moveTo(-15, 10); ctx.lineTo(-30, 10);
           ctx.stroke();
         } 
         else if (action.type === 'NOT') {
           ctx.beginPath();
           ctx.moveTo(-10, -10); ctx.lineTo(10, 0); ctx.lineTo(-10, 10); ctx.closePath();
           ctx.stroke();
           ctx.beginPath();
           ctx.arc(14, 0, 4, 0, Math.PI*2);
           ctx.stroke();
           ctx.beginPath();
           ctx.moveTo(18, 0); ctx.lineTo(28, 0);
           ctx.moveTo(-10, 0); ctx.lineTo(-20, 0);
           ctx.stroke();
         }

         ctx.restore();
       }
       
       if (isSelected) ctx.setLineDash([]);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to container
    canvas.width = containerRef.current.clientWidth;
    canvas.height = containerRef.current.clientHeight;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawings.forEach(d => renderAction(ctx, d));
    if (currentDrawing) renderAction(ctx, currentDrawing);

  }, [drawings, currentDrawing, containerRef.current?.clientWidth, containerRef.current?.clientHeight, selectedId, typingText, isTyping]);

  // --- Paste Handler ---
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                if (!blob) continue;

                const reader = new FileReader();
                reader.onload = (event) => {
                    const imageUrl = event.target?.result as string;
                    const img = new Image();
                    img.onload = () => {
                         const canvas = canvasRef.current;
                         const centerX = canvas ? canvas.width / 2 - img.width / 4 : 100;
                         const centerY = canvas ? canvas.height / 2 - img.height / 4 : 100;
                         
                         let w = img.width;
                         let h = img.height;
                         if (w > 500) {
                             const ratio = 500 / w;
                             w = 500;
                             h = h * ratio;
                         }

                         const newImageAction: DrawAction = {
                             id: Date.now().toString(),
                             type: 'IMAGE',
                             points: [{ x: centerX, y: centerY }],
                             color: '#000',
                             width: 2,
                             imageUrl: imageUrl,
                             imageSize: { w, h }
                         };
                         
                         addToHistory([...drawings, newImageAction]);
                    };
                    img.src = imageUrl;
                };
                reader.readAsDataURL(blob);
                break;
            }
        }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [drawings, historyStep]);

  // --- Event Handlers ---

  const getCanvasPoint = (e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left),
      y: (e.clientY - rect.top)
    };
  };

  const handleWheel = (e: React.WheelEvent) => {
      // Mouse Wheel Size Controller
      setStrokeWidth(prev => {
          const delta = e.deltaY > 0 ? -1 : 1;
          return Math.max(1, Math.min(50, prev + delta));
      });
  };

  const isPointInDrawing = (point: {x: number, y: number}, drawing: DrawAction) => {
    if (drawing.type === 'IMAGE' && drawing.imageSize && drawing.points.length > 0) {
        const start = drawing.points[0];
        const { w, h } = drawing.imageSize;
        return point.x >= start.x && point.x <= start.x + w &&
               point.y >= start.y && point.y <= start.y + h;
    }

    if (drawing.type === 'TEXT' && drawing.text && drawing.points.length > 0) {
        const fontSize = getFontSize(drawing.width);
        const start = drawing.points[0];
        
        const lines = drawing.text.split('\n');
        let maxWidth = 0;
        lines.forEach(line => {
             const w = line.length * (fontSize * 0.55);
             if (w > maxWidth) maxWidth = w;
        });
        const totalHeight = lines.length * (fontSize * 1.2);

        const p = 5; 
        return point.x >= start.x - p && point.x <= start.x + maxWidth + p &&
               point.y >= start.y - p && point.y <= start.y + totalHeight + p;
    }

    if (drawing.points.length === 0) return false;
    let minX = drawing.points[0].x, maxX = drawing.points[0].x;
    let minY = drawing.points[0].y, maxY = drawing.points[0].y;

    drawing.points.forEach(p => {
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    });

    const padding = 10;
    if (Math.abs(maxX - minX) < 10) { minX -= 20; maxX += 20; }
    if (Math.abs(maxY - minY) < 10) { minY -= 20; maxY += 20; }

    return point.x >= minX - padding && point.x <= maxX + padding && 
           point.y >= minY - padding && point.y <= maxY + padding;
  };

  const finalizeText = () => {
    if (!isTyping || !typingPos) return;

    if (typingText.trim().length > 0) {
        addToHistory([...drawings, {
            id: Date.now().toString(),
            type: 'TEXT',
            points: [typingPos],
            color: strokeColor,
            width: strokeWidth,
            text: typingText
        }]);
    }
    
    setIsTyping(false);
    setTypingText("");
    setTypingPos(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const point = getCanvasPoint(e);

    // RIGHT CLICK: Select / Move
    if (e.button === 2) {
        if (isTyping) {
            finalizeText();
            return;
        }

        const clickedIndex = [...drawings].reverse().findIndex(d => isPointInDrawing(point, d));
        if (clickedIndex !== -1) {
            const actualIndex = drawings.length - 1 - clickedIndex;
            setSelectedId(drawings[actualIndex].id);
            setIsDragging(true);
            setDragStart(point);
            // Snapshot for Undo of this move
            addToHistory([...drawings]);
        } else {
            setSelectedId(null);
        }
        return;
    }

    // LEFT CLICK: Draw
    if (e.button === 0) {
        if (tool === 'SELECT') return; // Safe Mode

        if (tool === 'TEXT') {
            setIsTyping(true);
            setTypingPos(point);
            setTypingText("");
            setTimeout(() => inputRef.current?.focus(), 50);
            return;
        }

        setCurrentDrawing({
          id: Date.now().toString(),
          type: tool,
          points: [point],
          color: strokeColor,
          width: strokeWidth,
          rows: tool === 'TABLE' ? tableRows : undefined,
          cols: tool === 'TABLE' ? tableCols : undefined
        });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const point = getCanvasPoint(e);

    // Handling Selection Move
    if (isDragging && selectedId && dragStart) {
      const dx = point.x - dragStart.x;
      const dy = point.y - dragStart.y;
      
      const newDrawings = drawings.map(d => {
        if (d.id === selectedId) {
          return { ...d, points: d.points.map(p => ({ x: p.x + dx, y: p.y + dy })) };
        }
        return d;
      });
      
      // Update the current history head in place for visual feedback
      const newHistory = [...history];
      newHistory[historyStep] = newDrawings;
      setHistory(newHistory);
      
      setDragStart(point); 
      return;
    }

    // Handling Drawing
    if (currentDrawing) {
      if (['PEN', 'ERASER'].includes(tool)) {
        setCurrentDrawing({ ...currentDrawing, points: [...currentDrawing.points, point] });
      } else {
        setCurrentDrawing({ ...currentDrawing, points: [currentDrawing.points[0], point] });
      }
    }
  };

  const handleMouseUp = () => {
    // If we were dragging, we are done. 
    // The history step was already updated in place during Move.
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      return;
    }
    
    // If we were drawing, save to history
    if (currentDrawing) {
      addToHistory([...drawings, currentDrawing]);
      setCurrentDrawing(null);
    }
  };

  const handleClear = () => {
    if(confirm("Clear the entire whiteboard?")) addToHistory([]);
  };

  const handleDeleteSelected = () => {
      if(selectedId) {
          addToHistory(drawings.filter(d => d.id !== selectedId));
          setSelectedId(null);
      }
  };

  const handleExport = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `whiteboard-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  const handleCopy = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        alert('Whiteboard copied to clipboard!');
      });
    } catch (err) {
      console.error('Copy failed', err);
      alert('Failed to copy to clipboard.');
    }
  };

  // --- AI Capability Implementation ---

  const getApiKey = (): string | undefined => {
    const potentialKeys = [
      // @ts-ignore
      (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_API_KEY : undefined,
      // @ts-ignore
      (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.API_KEY : undefined,
      (typeof process !== 'undefined' && process.env) ? process.env.REACT_APP_API_KEY : undefined,
      (typeof process !== 'undefined' && process.env) ? process.env.NEXT_PUBLIC_API_KEY : undefined,
      (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined,
    ];
    return potentialKeys.find(key => key && key.trim().length > 0);
  };

  const runAIAnalysis = async (mode: 'EXPLAIN' | 'MATH' | 'REALIZE') => {
    if (!canvasRef.current) return;
    
    setAiMode(mode);
    setIsAnalyzing(true);
    setAiResult(null);
    setAiImage(null);

    try {
        const apiKey = getApiKey();
        if (!apiKey) throw new Error("API Key missing");

        const ai = new GoogleGenAI({ apiKey });
        const canvasData = canvasRef.current.toDataURL('image/png');
        const base64Data = canvasData.split(',')[1];

        if (mode === 'REALIZE') {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { inlineData: { mimeType: 'image/png', data: base64Data } },
                        { text: "Transform this sketch into a realistic, high-quality image. If it is a technical diagram (like a circuit), render it with real-world components. Also, provide a brief text explanation of how the system in the image works." }
                    ]
                }
            });
            
            const parts = response.candidates?.[0]?.content?.parts || [];
            let textOut = "";
            let imageFound = false;

            for (const part of parts) {
                if (part.text) {
                    textOut += part.text;
                }
                if (part.inlineData) {
                    const imgUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    setAiImage(imgUrl);
                    imageFound = true;
                }
            }
            
            setAiResult(textOut || (imageFound ? "Here is the realistic visualization of your sketch." : "Analysis complete."));
        } else {
            let prompt = "";
            if (mode === 'EXPLAIN') {
                prompt = "Analyze the diagram, notes, or schematic in this whiteboard image. Explain what it represents, how it works, and provide any relevant context. Keep it concise but helpful.";
            } else if (mode === 'MATH') {
                prompt = "Identify the mathematical equations or problems handwritten in this image. Solve them step-by-step and provide the final answer clearly.";
            }

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts: [{ inlineData: { mimeType: 'image/png', data: base64Data } }, { text: prompt }] }
            });

            if (response.text) {
                setAiResult(response.text);
            } else {
                setAiResult("Could not analyze the board. Please try again.");
            }
        }

    } catch (e: any) {
        console.error(e);
        setAiResult("Error: " + (e.message || "Failed to connect to AI."));
    } finally {
        setIsAnalyzing(false);
    }
  };

  const ToolBtn = ({t, icon, label}: {t: ToolType, icon: React.ReactNode, label: string}) => (
    <div className="relative group">
        <button 
        onClick={() => {
            setTool(t);
            if (isTyping) finalizeText();
        }} 
        className={`p-2 rounded-lg transition-all ${tool === t ? 'bg-brand-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
        >
        {icon}
        </button>
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {label}
        </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden relative font-sans">
      
      {/* Saved Pages Drawer */}
      {showSavedList && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white dark:bg-slate-900 w-96 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80vh]">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">Saved Boards</h3>
                      <button onClick={() => setShowSavedList(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X size={20}/></button>
                  </div>
                  <div className="overflow-y-auto flex-1 p-2 space-y-2">
                      {savedBoards.length === 0 ? (
                          <div className="text-center py-10 text-slate-400">No saved boards yet.</div>
                      ) : (
                          savedBoards.map(board => (
                              <div key={board.id} onClick={() => loadBoard(board)} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-slate-800 cursor-pointer group flex items-center justify-between">
                                  <div>
                                      <div className="font-medium text-slate-800 dark:text-slate-200">{board.name}</div>
                                      <div className="text-xs text-slate-400">{board.date} • {board.data.length} items</div>
                                  </div>
                                  <button onClick={(e) => deleteBoard(e, board.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                      <Trash2 size={16} />
                                  </button>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Floating Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2">
         {/* Main Tools */}
         <div className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-2 flex gap-2 border border-slate-200 dark:border-slate-700 items-center overflow-x-auto max-w-[90vw]">
            
            {/* AI Group (Code Removed) */}
            <div className="flex gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
               <button onClick={() => runAIAnalysis('EXPLAIN')} className="p-2 rounded-lg text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/30 group relative" title="AI Explain">
                  <Bot size={20}/>
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">AI Explain</div>
               </button>
               <button onClick={() => runAIAnalysis('MATH')} className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 group relative" title="AI Solve Math">
                  <Calculator size={20}/>
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">AI Math</div>
               </button>
               <button onClick={() => runAIAnalysis('REALIZE')} className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/30 group relative" title="Visualize">
                  <Wand2 size={20}/>
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Visualize</div>
               </button>
            </div>

            {/* Basic Group */}
            <div className="flex gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
              <ToolBtn t="SELECT" icon={<MousePointer2 size={20}/>} label="Select (Right Click)" />
              <ToolBtn t="PEN" icon={<PenTool size={20}/>} label="Pen" />
              <ToolBtn t="ERASER" icon={<Eraser size={20}/>} label="Eraser" />
              <ToolBtn t="TEXT" icon={<Type size={20}/>} label="Text" />
              <ToolBtn t="IMAGE" icon={<ImageIcon size={20}/>} label="Paste Image" />
            </div>

            {/* Shapes Group */}
            <div className="flex gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
              <ToolBtn t="LINE" icon={<Minus size={20} className="-rotate-45"/>} label="Line" />
              <ToolBtn t="ARROW" icon={<ArrowUpRight size={20}/>} label="Arrow" />
              <ToolBtn t="RECT" icon={<Square size={20}/>} label="Rect" />
              <ToolBtn t="CIRCLE" icon={<Circle size={20}/>} label="Circle" />
              <ToolBtn t="TABLE" icon={<Grid3X3 size={20}/>} label="Table" />
            </div>

            {/* Engineering Group */}
            <div className="flex gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
              <ToolBtn t="RESISTOR" icon={<Activity size={20}/>} label="Resistor" />
              <ToolBtn t="CAPACITOR" icon={<Battery size={20} className="rotate-90"/>} label="Capacitor" />
              <ToolBtn t="INDUCTOR" icon={<Anchor size={20}/>} label="Inductor" />
              <ToolBtn t="SOURCE" icon={<Zap size={20}/>} label="Source" />
              <ToolBtn t="DIODE" icon={<Triangle size={18} className="rotate-90"/>} label="Diode" />
            </div>

            {/* Logic Gates Group */}
            <div className="flex gap-1">
              <ToolBtn t="AND" icon={<span className="font-bold text-xs font-mono">AND</span>} label="AND" />
              <ToolBtn t="OR" icon={<span className="font-bold text-xs font-mono">OR</span>} label="OR" />
              <ToolBtn t="NOT" icon={<span className="font-bold text-xs font-mono">NOT</span>} label="NOT" />
            </div>
            
            {/* Undo/Redo Group */}
            <div className="flex gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
                 <button onClick={undo} disabled={historyStep === 0} className="p-2 text-slate-600 disabled:opacity-30 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-800 group relative">
                     <Undo2 size={20} />
                     <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Undo</div>
                 </button>
                 <button onClick={redo} disabled={historyStep === history.length - 1} className="p-2 text-slate-600 disabled:opacity-30 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-800 group relative">
                     <Redo2 size={20} />
                     <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Redo</div>
                 </button>
            </div>
         </div>

         {/* Contextual Toolbar for Table */}
         {tool === 'TABLE' && (
            <div className="bg-white dark:bg-slate-900 shadow-lg rounded-xl p-2 flex items-center gap-2 border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                <span className="text-xs font-bold text-slate-500">Rows:</span>
                <input 
                    type="number" 
                    min="1" 
                    max="10" 
                    value={tableRows} 
                    onChange={(e) => setTableRows(parseInt(e.target.value) || 1)} 
                    className="w-12 h-8 text-sm text-center rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" 
                />
                <span className="text-xs font-bold text-slate-500">Cols:</span>
                <input 
                    type="number" 
                    min="1" 
                    max="10" 
                    value={tableCols} 
                    onChange={(e) => setTableCols(parseInt(e.target.value) || 1)} 
                    className="w-12 h-8 text-sm text-center rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" 
                />
            </div>
         )}
      </div>

      {/* Floating Action Menu (Colors, Actions) */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3">
         <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col gap-3 items-center">
            <input 
              type="color" 
              value={strokeColor} 
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-8 h-8 rounded-full overflow-hidden border-2 border-slate-200 cursor-pointer"
            />
            <div className="h-px w-full bg-slate-200 dark:bg-slate-700"></div>
            {/* Stroke Width / Wheel Indicator */}
            <div className="flex flex-col items-center gap-1 group relative">
               <Mouse size={14} className="text-slate-400"/>
               <div className="text-xs font-bold text-slate-600 dark:text-slate-300">{strokeWidth}px</div>
               <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Scroll to Resize</div>
            </div>
         </div>

         <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
            <button onClick={saveBoard} className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg group relative" title="Save Board">
               <Save size={20} />
               <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Save Page</div>
            </button>
            <button onClick={() => setShowSavedList(true)} className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg group relative" title="Open Saved">
               <FolderOpen size={20} />
               <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Saved Pages</div>
            </button>
            <div className="h-px w-full bg-slate-200 dark:bg-slate-700 my-1"></div>
            <button onClick={handleExport} className="p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg group relative" title="Export Image">
               <Download size={20} />
               <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Export</div>
            </button>
            <button onClick={handleCopy} className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg group relative" title="Copy to Clipboard">
               <Copy size={20} />
               <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Copy Clipboard</div>
            </button>
            <button onClick={handleClear} className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg group relative" title="Clear Page">
               <Trash2 size={20} />
               <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Clear All</div>
            </button>
            {selectedId && (
              <button onClick={handleDeleteSelected} className="p-2 text-red-500 hover:bg-red-50 rounded-lg group relative" title="Delete Selected">
                 <X size={20} />
                 <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Delete Selection</div>
              </button>
            )}
         </div>
         
         <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
            <button onClick={onBack} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg group relative" title="Exit Whiteboard">
               <ArrowUpRight className="rotate-180" size={20} />
               <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Exit</div>
            </button>
         </div>
      </div>

      {/* Main Canvas Area */}
      <div ref={containerRef} className="flex-1 relative cursor-crosshair bg-slate-100 dark:bg-slate-800">
         <div className="absolute inset-0 pointer-events-none opacity-5" 
              style={{
                  backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', 
                  backgroundSize: '20px 20px'
              }}
         ></div>
         
         {isTyping && typingPos && (
             <textarea
                ref={inputRef}
                value={typingText}
                onChange={(e) => setTypingText(e.target.value)}
                placeholder="Type here..."
                className="absolute z-10 bg-transparent border border-dashed border-brand-400 outline-none p-1 resize min-w-[100px] overflow-hidden"
                style={{
                    left: typingPos.x,
                    top: typingPos.y,
                    font: `${getFontSize(strokeWidth)}px sans-serif`,
                    color: strokeColor,
                    lineHeight: '1.2',
                }}
                autoFocus
             />
         )}

         <canvas 
            ref={canvasRef}
            className="w-full h-full block"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onContextMenu={(e) => e.preventDefault()}
         />
      </div>

      {/* AI Result Modal */}
      {(isAnalyzing || aiResult || aiImage) && (
          <div className="absolute top-20 right-4 w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 flex flex-col animate-in fade-in slide-in-from-right-10">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-brand-600 dark:text-brand-400" />
                      <span className="font-semibold text-slate-900 dark:text-white">
                          {isAnalyzing ? 'Analyzing Board...' : 'AI Analysis Result'}
                      </span>
                  </div>
                  <button onClick={() => { setAiResult(null); setAiImage(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      <XCircle size={20} />
                  </button>
              </div>
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                  {isAnalyzing ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">
                             {aiMode === 'MATH' ? 'Solving equations...' : 
                              aiMode === 'REALIZE' ? 'Rendering realistic visualization...' :
                              'Understanding your diagram...'}
                          </p>
                      </div>
                  ) : (
                      <div className="space-y-4">
                          {aiImage && (
                              <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                                  <img src={aiImage} alt="AI Generated" className="w-full h-auto object-cover" />
                              </div>
                          )}
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                              <p className="whitespace-pre-wrap font-medium text-slate-700 dark:text-slate-300">
                                 {aiResult}
                              </p>
                              <div className="mt-6 flex justify-end gap-2">
                                 {aiImage && (
                                     <Button size="sm" variant="outline" onClick={() => {
                                         const link = document.createElement('a');
                                         link.href = aiImage;
                                         link.download = 'ai-visualized-sketch.png';
                                         link.click();
                                     }}>
                                        <Download size={16} className="mr-2"/> Save Image
                                     </Button>
                                 )}
                                 <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(aiResult || '')}>
                                    <Check size={16} className="mr-2"/> Copy Text
                                 </Button>
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}
      
    </div>
  );
};
