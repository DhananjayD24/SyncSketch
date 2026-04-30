import { useEffect, useRef, useState } from 'react';
import { socket } from '../socket';

export default function Canvas({ tool, color, brushSize, canDraw, canvasBg }) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const containerRef = useRef(null);
  const historyRef = useRef([]); // Local history
  const [isDrawing, setIsDrawing] = useState(false);
  const [pointerPos, setPointerPos] = useState({ x: -100, y: -100 });
  const [isPointerIn, setIsPointerIn] = useState(false);

  const saveStateToHistory = () => {
    if (!canvasRef.current) return;
    const currentState = canvasRef.current.toDataURL();
    historyRef.current.push(currentState);
    if (historyRef.current.length > 20) {
      historyRef.current.shift(); // Max 20 states
    }
  };

  // Resize canvas when window changes
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      // Save canvas content before resizing
      const imageData = contextRef.current?.getImageData(0, 0, canvas.width, canvas.height);

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      const context = canvas.getContext('2d');
      context.lineCap = 'round';
      context.lineJoin = 'round';
      contextRef.current = context;

      // Restore content
      if (imageData) {
        context.putImageData(imageData, 0, 0);
      } else {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set up socket listeners
  useEffect(() => {
    socket.on('draw', (data) => {
      if (!contextRef.current) return;
      const ctx = contextRef.current;
      drawOnCanvas(ctx, data);
    });

    socket.on('clear_canvas', () => {
      if (!contextRef.current || !canvasRef.current) return;
      saveStateToHistory();
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    });

    socket.on('stroke_start', () => {
      saveStateToHistory();
    });

    socket.on('perform_undo', () => {
      if (!contextRef.current || !canvasRef.current) return;
      
      const prevState = historyRef.current.pop();
      if (prevState) {
        const img = new Image();
        img.onload = () => {
          contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          contextRef.current.drawImage(img, 0, 0);
        };
        img.src = prevState;
      } else {
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    });

    socket.on('request_canvas_state', (requesterId) => {
      if (!canvasRef.current) return;
      const canvasState = canvasRef.current.toDataURL();
      socket.emit('send_canvas_state', { to: requesterId, canvasState });
    });

    socket.on('init_canvas_state', (canvasState) => {
      if (!contextRef.current || !canvasRef.current) return;
      const img = new Image();
      img.onload = () => {
        contextRef.current.drawImage(img, 0, 0);
      };
      img.src = canvasState;
    });

    return () => {
      socket.off('draw');
      socket.off('clear_canvas');
      socket.off('stroke_start');
      socket.off('perform_undo');
      socket.off('request_canvas_state');
      socket.off('init_canvas_state');
    };
  }, []);

  const drawOnCanvas = (ctx, data) => {
    const { prevX, prevY, x, y, tool, color, size } = data;

    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = size * 2; // Make eraser slightly bigger
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.shadowBlur = 0;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = size;
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = size > 2 ? 2 : 0; // Subtle glow
    }

    ctx.stroke();
    ctx.closePath();
    
    // Reset shadow for performance
    ctx.shadowBlur = 0;
  };

  const getCoordinates = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure && e.pointerType !== 'mouse' ? e.pressure : 0.5 // iPad/Stylus pressure
    };
  };

  const startDrawing = (e) => {
    if (!canDraw) return;
    
    saveStateToHistory();
    socket.emit('stroke_start');
    
    const { x, y } = getCoordinates(e);
    setIsDrawing(true);
    setPointerPos({ x, y });
    e.target.setPointerCapture(e.pointerId);
  };

  let lastEmit = Date.now();
  const throttleEmit = (data) => {
    const now = Date.now();
    if (now - lastEmit >= 15) { // ~60fps / slightly throttled
      socket.emit('draw', data);
      lastEmit = now;
    }
  };

  const draw = (e) => {
    // Always update pointer position for hover effect
    const { x, y, pressure } = getCoordinates(e);
    setPointerPos({ x, y });

    if (!isDrawing || !canDraw || !contextRef.current) return;

    const currentX = x;
    const currentY = y;
    const prevX = pointerPos.x;
    const prevY = pointerPos.y;

    // Adjust size by pressure. For stylus, pressure usually 0-1.
    // Base size is brushSize, min size 1.
    const dynamicSize = Math.max(1, brushSize * (pressure * 2));

    const data = {
      prevX,
      prevY,
      x: currentX,
      y: currentY,
      tool,
      color,
      size: dynamicSize
    };

    drawOnCanvas(contextRef.current, data);
    throttleEmit(data);

    // set pointer pos to current for next frame
    setPointerPos({ x: currentX, y: currentY });
  };

  const stopDrawing = (e) => {
    setIsDrawing(false);
    if (e && e.pointerId) {
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative"
      onMouseEnter={() => setIsPointerIn(true)}
      onMouseLeave={() => {
        setIsPointerIn(false);
        stopDrawing();
      }}
    >
      <canvas
        ref={canvasRef}
        className={`w-full h-full touch-none transition-colors duration-300 ${!canDraw ? 'cursor-not-allowed' : 'cursor-none'}`}
        style={{ backgroundColor: canvasBg }}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerCancel={stopDrawing}
      />
      
      {/* Custom Red Pointer - only show when hover and can draw */}
      {isPointerIn && canDraw && (
        <div 
          className="absolute rounded-full border-2 border-red-500 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center mix-blend-difference"
          style={{ 
            left: `${pointerPos.x}px`, 
            top: `${pointerPos.y}px`,
            width: `${tool === 'eraser' ? brushSize * 2 : brushSize}px`,
            height: `${tool === 'eraser' ? brushSize * 2 : brushSize}px`,
            minWidth: '4px',
            minHeight: '4px',
            opacity: isDrawing ? 0.5 : 1,
            transition: 'opacity 0.1s'
          }}
        >
          {tool === 'pencil' && brushSize >= 10 && (
             <div className="w-1 h-1 rounded-full bg-red-500"></div>
          )}
        </div>
      )}
    </div>
  );
}
