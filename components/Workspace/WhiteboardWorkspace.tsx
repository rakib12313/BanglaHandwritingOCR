import React, { useState, useRef, useEffect } from 'react';
import { 
  MousePointer2, PenTool, Eraser, Minus, ArrowUpRight, Square, Circle, Grid3X3, 
  Trash2, Download, Undo, Redo, Activity, Battery, Anchor, Zap, Cpu, MoreHorizontal,
  Triangle, Copy, X
} from 'lucide-react';

// Drawing Types
type ToolType = 
  'SELECT' | 'PEN' | 'ERASER' | 'LINE' | 'ARROW' | 'RECT' | 'CIRCLE' | 'TABLE' |
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
}

interface WhiteboardProps {
    onBack: () => void;
}

export const WhiteboardWorkspace: React.FC<WhiteboardProps> = ({ onBack }) => {
  const [tool, setTool] = useState<ToolType>('PEN');
  const [drawings, setDrawings] = useState<DrawAction[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<DrawAction | null>(null);
  const [strokeColor, setStrokeColor] = useState('#1e293b'); // slate-800
  const [strokeWidth, setStrokeWidth] = useState(2);
  
  // Selection
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);

  // Table Config
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Rendering Logic ---
  
  const renderAction = (ctx: CanvasRenderingContext2D, action: DrawAction) => {
       const isSelected = action.id === selectedId;
       ctx.strokeStyle = isSelected ? '#3b82f6' : action.color;
       ctx.fillStyle = action.color;
       ctx.lineWidth = isSelected ? action.width + 2 : action.width;
       ctx.lineCap = 'round';
       ctx.lineJoin = 'round';
       
       if (isSelected) {
         ctx.setLineDash([5, 5]);
       } else {
         ctx.setLineDash([]);
       }

       ctx.beginPath();

       if (action.points.length === 0) return;

       const start = action.points[0];
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

  }, [drawings, currentDrawing, containerRef.current?.clientWidth, containerRef.current?.clientHeight, selectedId]);


  // --- Event Handlers ---

  const getCanvasPoint = (e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left),
      y: (e.clientY - rect.top)
    };
  };

  const isPointInDrawing = (point: {x: number, y: number}, drawing: DrawAction) => {
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

  const handleMouseDown = (e: React.MouseEvent) => {
    const point = getCanvasPoint(e);

    if (tool === 'SELECT') {
       const clickedIndex = [...drawings].reverse().findIndex(d => isPointInDrawing(point, d));
       if (clickedIndex !== -1) {
         const actualIndex = drawings.length - 1 - clickedIndex;
         setSelectedId(drawings[actualIndex].id);
         setIsDragging(true);
         setDragStart(point);
       } else {
         setSelectedId(null);
       }
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
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const point = getCanvasPoint(e);

    if (tool === 'SELECT' && isDragging && selectedId && dragStart) {
      const dx = point.x - dragStart.x;
      const dy = point.y - dragStart.y;
      
      setDrawings(prev => prev.map(d => {
        if (d.id === selectedId) {
          return { ...d, points: d.points.map(p => ({ x: p.x + dx, y: p.y + dy })) };
        }
        return d;
      }));
      setDragStart(point); 
      return;
    }

    if (!currentDrawing) return;
    
    if (['PEN', 'ERASER'].includes(tool)) {
      setCurrentDrawing({ ...currentDrawing, points: [...currentDrawing.points, point] });
    } else {
      setCurrentDrawing({ ...currentDrawing, points: [currentDrawing.points[0], point] });
    }
  };

  const handleMouseUp = () => {
    if (tool === 'SELECT') {
      setIsDragging(false);
      setDragStart(null);
      return;
    }
    if (currentDrawing) {
      setDrawings([...drawings, currentDrawing]);
      setCurrentDrawing(null);
    }
  };

  const handleClear = () => {
    if(confirm("Clear the entire whiteboard?")) setDrawings([]);
  };

  const handleExport = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `whiteboard-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  // --- Toolbar Component Helper ---
  const ToolBtn = ({t, icon, label}: {t: ToolType, icon: React.ReactNode, label: string}) => (
    <button 
      onClick={() => setTool(t)} 
      title={label}
      className={`p-2 rounded-lg transition-all ${tool === t ? 'bg-brand-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden relative font-sans">
      
      {/* Floating Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-2 flex gap-2 border border-slate-200 dark:border-slate-700 items-center overflow-x-auto max-w-[90vw]">
        
        {/* Basic Group */}
        <div className="flex gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
          <ToolBtn t="SELECT" icon={<MousePointer2 size={20}/>} label="Select" />
          <ToolBtn t="PEN" icon={<PenTool size={20}/>} label="Pen" />
          <ToolBtn t="ERASER" icon={<Eraser size={20}/>} label="Eraser" />
        </div>

        {/* Shapes Group */}
        <div className="flex gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
          <ToolBtn t="LINE" icon={<Minus size={20} className="-rotate-45"/>} label="Line" />
          <ToolBtn t="ARROW" icon={<ArrowUpRight size={20}/>} label="Arrow" />
          <ToolBtn t="RECT" icon={<Square size={20}/>} label="Rectangle" />
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
          <ToolBtn t="AND" icon={<span className="font-bold text-xs font-mono">AND</span>} label="AND Gate" />
          <ToolBtn t="OR" icon={<span className="font-bold text-xs font-mono">OR</span>} label="OR Gate" />
          <ToolBtn t="NOT" icon={<span className="font-bold text-xs font-mono">NOT</span>} label="NOT Gate" />
        </div>

      </div>

      {/* Floating Action Menu (Colors, Actions) */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
         <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col gap-3 items-center">
            <input 
              type="color" 
              value={strokeColor} 
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-8 h-8 rounded-full overflow-hidden border-2 border-slate-200 cursor-pointer"
            />
            <div className="h-px w-full bg-slate-200 dark:bg-slate-700"></div>
            <select 
               value={strokeWidth} 
               onChange={(e) => setStrokeWidth(Number(e.target.value))}
               className="w-full text-xs p-1 rounded bg-slate-100 dark:bg-slate-800 text-center"
            >
               <option value={2}>Thin</option>
               <option value={4}>Med</option>
               <option value={8}>Bold</option>
            </select>
         </div>

         <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
            <button onClick={handleExport} className="p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg" title="Export Image">
               <Download size={20} />
            </button>
            <button onClick={handleClear} className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Clear Page">
               <Trash2 size={20} />
            </button>
            {selectedId && (
              <button onClick={() => {
                setDrawings(prev => prev.filter(d => d.id !== selectedId));
                setSelectedId(null);
              }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Delete Selected">
                 <X size={20} />
              </button>
            )}
         </div>
         
         <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
            <button onClick={onBack} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg" title="Exit Whiteboard">
               <ArrowUpRight className="rotate-180" size={20} />
            </button>
         </div>
      </div>

      {/* Main Canvas Area */}
      <div ref={containerRef} className="flex-1 relative cursor-crosshair bg-slate-100 dark:bg-slate-800">
         {/* Grid Background */}
         <div className="absolute inset-0 pointer-events-none opacity-5" 
              style={{
                  backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', 
                  backgroundSize: '20px 20px'
              }}
         ></div>
         <canvas 
            ref={canvasRef}
            className="w-full h-full block"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
         />
      </div>
      
    </div>
  );
};