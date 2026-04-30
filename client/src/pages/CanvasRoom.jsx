import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import Canvas from '../components/Canvas';
import Toolbar from '../components/Toolbar';
import UsersList from '../components/UsersList';
import { LogOut, Users, Share2, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CanvasRoom() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username;

  const [roomData, setRoomData] = useState({ host: null, users: [], drawingEnabled: true, canvasBg: 'dark' });
  const [tool, setTool] = useState('pencil'); // 'pencil' or 'eraser'
  const [color, setColor] = useState('#a855f7');
  const [brushSize, setBrushSize] = useState(3);
  const [showUsers, setShowUsers] = useState(false);

  useEffect(() => {
    if (!username) {
      navigate(`/?room=${roomId}`);
      return;
    }

    socket.connect();
    socket.emit('join_room', { roomId, username });

    socket.on('room_data', (data) => {
      setRoomData(data);
    });

    socket.on('drawing_toggled', (enabled) => {
      setRoomData(prev => ({ ...prev, drawingEnabled: enabled }));
    });

    socket.on('canvas_bg_changed', (bgMode) => {
      setRoomData(prev => ({ ...prev, canvasBg: bgMode }));
    });

    socket.on('user_joined', (joinedUsername) => {
      if (joinedUsername !== username) {
        toast.success(`${joinedUsername} joined the room`);
      }
    });

    socket.on('user_left', (leftUsername) => {
      if (leftUsername !== username) {
        toast.info(`${leftUsername} left the room`);
      }
    });

    return () => {
      socket.emit('leave_room');
      socket.off('room_data');
      socket.off('drawing_toggled');
      socket.off('canvas_bg_changed');
      socket.off('user_joined');
      socket.off('user_left');
    };
  }, [roomId, username, navigate]);

  const isHost = socket.id === roomData.host;
  const currentUser = roomData.users.find(u => u.id === socket.id);
  const canDraw = isHost || (currentUser ? currentUser.canDraw : false);

  const handleClearCanvas = () => {
    if (isHost) {
      socket.emit('clear_canvas');
    }
  };

  const handleToggleDrawing = () => {
    if (isHost) {
      socket.emit('toggle_drawing', !roomData.drawingEnabled);
    }
  };

  const handleToggleUserDrawing = (userId, canDraw) => {
    if (isHost) {
      socket.emit('toggle_user_drawing', { userId, canDraw });
    }
  };

  const handleChangeCanvasBg = (bgMode) => {
    if (isHost) {
      socket.emit('change_canvas_bg', bgMode);
    }
  };

  const handleTransferHost = (newHostId) => {
    if (isHost) {
      socket.emit('transfer_host', newHostId);
    }
  };

  const handleLeave = () => {
    navigate('/');
  };

  const handleUndo = () => {
    if (canDraw) {
      socket.emit('trigger_undo');
    }
  };

  const [isCopied, setIsCopied] = useState(false);
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    toast.success('Room link copied!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Wait until we receive the room data from the server before rendering
  if (!roomData.host) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <h2 className="text-xl font-semibold">Connecting to room...</h2>
        <p className="text-gray-500 text-sm mt-2">Waiting for server response</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden font-sans">
      {/* Sidebar / Toolbar */}
      <div className="w-20 md:w-[320px] bg-[#121212]/95 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between shrink-0 shadow-2xl z-20 transition-all">
        <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
          <div className="p-5 border-b border-white/5 hidden md:block">
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 tracking-tight mb-2">SyncSketch</h2>
            <div className="flex items-center justify-between bg-black/40 py-2 px-3 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
                Room: <span className="font-semibold text-gray-200">{roomId}</span>
              </div>
              <button 
                onClick={handleCopyLink}
                className="text-gray-400 hover:text-white transition-colors"
                title="Copy Room Link"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Toolbar 
            tool={tool} 
            setTool={setTool} 
            color={color} 
            setColor={setColor} 
            brushSize={brushSize} 
            setBrushSize={setBrushSize}
            isHost={isHost}
            drawingEnabled={roomData.drawingEnabled}
            canvasBg={roomData.canvasBg}
            onClearCanvas={handleClearCanvas}
            onToggleDrawing={handleToggleDrawing}
            onChangeCanvasBg={handleChangeCanvasBg}
            onUndo={handleUndo}
          />
          
          <div className="mt-auto hidden md:block p-4 border-t border-white/5 bg-black/20">
            <UsersList 
              users={roomData.users} 
              hostId={roomData.host} 
              isHost={isHost} 
              onTransferHost={handleTransferHost} 
              onToggleUserDrawing={handleToggleUserDrawing}
            />
          </div>
        </div>

        {/* Mobile controls */}
        <div className="mt-auto md:hidden flex flex-col items-center gap-4 pb-6 pt-4 border-t border-white/5">
          <button 
            onClick={() => setShowUsers(!showUsers)}
            className={`p-3 rounded-xl transition-all ${showUsers ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Users className="w-5 h-5" />
          </button>
          <button 
            onClick={handleLeave}
            className="p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative cursor-crosshair">
        {/* Mobile users list overlay */}
        {showUsers && (
          <div className="absolute top-4 left-4 z-30 w-64 bg-[#1e1e1e]/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 p-4 md:hidden">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Room Members</h3>
            <UsersList 
              users={roomData.users} 
              hostId={roomData.host} 
              isHost={isHost} 
              onTransferHost={handleTransferHost} 
              onToggleUserDrawing={handleToggleUserDrawing}
            />
          </div>
        )}

        {/* Top right leave button (desktop) */}
        <div className="absolute top-4 right-4 z-20 hidden md:flex items-center gap-3">
          {!canDraw && !isHost && (
            <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-md flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              Drawing Disabled by Host
            </div>
          )}
          <button
            onClick={handleLeave}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all font-medium text-sm backdrop-blur-md"
          >
            <LogOut className="w-4 h-4" />
            Leave
          </button>
        </div>

        {/* Canvas component handles drawing */}
        <Canvas 
          tool={tool} 
          color={color} 
          brushSize={brushSize} 
          canDraw={canDraw}
          canvasBg={roomData.canvasBg}
        />
      </div>
    </div>
  );
}
