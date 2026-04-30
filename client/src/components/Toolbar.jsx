import { Pen, Eraser, Trash2, Power, PowerOff, Undo } from 'lucide-react';

export default function Toolbar({ 
  tool, setTool, color, setColor, brushSize, setBrushSize,
  isHost, drawingEnabled, canvasBg, onClearCanvas, onToggleDrawing, onChangeCanvasBg, onUndo
}) {
  return (
    <div className="flex-1 flex flex-col p-3 md:p-5 gap-6">
      {/* Tools Section */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden md:block pl-1">Tools</h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setTool('pencil')}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
              tool === 'pencil' 
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Pen className="w-5 h-5 shrink-0" />
            <span className="font-medium hidden md:block">Pencil</span>
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
              tool === 'eraser' 
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Eraser className="w-5 h-5 shrink-0" />
            <span className="font-medium hidden md:block">Eraser</span>
          </button>
          <button
            onClick={onUndo}
            className="flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"
            title="Undo"
          >
            <Undo className="w-5 h-5 shrink-0" />
            <span className="font-medium hidden md:block">Undo</span>
          </button>
        </div>
      </div>

      {/* Settings Section */}
      <div className="space-y-5">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden md:block pl-1">Settings</h3>
        
        {/* Colors */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-gray-400 hidden md:block">Pencil Color</label>
            <div className="flex items-center gap-2">
              <div 
                className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 shadow-lg border-2 border-white/10 transition-transform hover:scale-105"
                style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}80` }}
              >
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-[-20px] w-[80px] h-[80px] cursor-pointer"
                  title="Pencil Color"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 hidden md:block pl-1">Canvas Color</label>
            <div className="flex items-center gap-2">
              <div 
                className={`relative w-9 h-9 rounded-full overflow-hidden shrink-0 shadow-lg border-2 transition-transform hover:scale-105 ${!isHost ? 'opacity-50 cursor-not-allowed border-white/5' : 'border-white/10 cursor-pointer'}`}
                style={{ backgroundColor: canvasBg }}
              >
                <input
                  type="color"
                  value={canvasBg}
                  onChange={(e) => onChangeCanvasBg(e.target.value)}
                  className="absolute inset-[-20px] w-[80px] h-[80px] cursor-pointer"
                  title="Canvas Color"
                  disabled={!isHost}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Brush Size */}
        <div className="space-y-3 hidden md:block mt-6 bg-black/20 p-4 rounded-xl border border-white/5">
          <label className="text-xs font-medium text-gray-300 flex justify-between items-center">
            <span>Brush Size</span>
            <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-bold">{brushSize}px</span>
          </label>
          <input
            type="range"
            min="1"
            max="30"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
          />
        </div>
      </div>

      {/* Host Controls */}
      {isHost && (
        <div className="space-y-3 mt-auto pt-5 border-t border-white/5">
          <h3 className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start pl-1">
            <span className="hidden md:inline">Admin Controls</span>
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full md:hidden shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
          </h3>
          <div className="flex flex-col gap-2">
            <button
              onClick={onToggleDrawing}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                drawingEnabled 
                  ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                  : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
              }`}
            >
              {drawingEnabled ? <Power className="w-5 h-5 shrink-0" /> : <PowerOff className="w-5 h-5 shrink-0" />}
              <span className="font-medium text-sm hidden md:block">
                {drawingEnabled ? 'Drawing: ON' : 'Drawing: OFF'}
              </span>
            </button>
            <button
              onClick={onClearCanvas}
              className="flex items-center gap-3 p-3 rounded-xl text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all border border-transparent hover:border-red-500/30"
            >
              <Trash2 className="w-5 h-5 shrink-0" />
              <span className="font-medium text-sm hidden md:block">Clear Canvas</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
