import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Palette, Users, Sparkles, ArrowRight, Copy, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../utils';

export default function JoinRoom() {
  const [searchParams] = useSearchParams();
  const initialRoomId = searchParams.get('room') || '';
  
  const [mode, setMode] = useState(initialRoomId ? 'join' : 'create'); // 'join' or 'create'
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState(initialRoomId);
  
  // Create mode specific
  const [generatedId, setGeneratedId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  const navigate = useNavigate();

  const handleJoin = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }
    if (mode === 'join' && !roomId.trim()) {
      toast.error('Please enter a Room ID');
      return;
    }

    setIsEntering(true);
    // Simulate slight loading for better UX
    setTimeout(() => {
      const targetRoom = mode === 'join' ? roomId.trim() : generatedId;
      toast.success(`Entering room: ${targetRoom}`);
      navigate(`/room/${targetRoom}`, { state: { username: username.trim() } });
    }, 600);
  };

  const handleGenerateRoom = () => {
    if (!username.trim()) {
      toast.error('Please enter a username first');
      return;
    }
    setIsGenerating(true);
    // Simulate network delay
    setTimeout(() => {
      const newId = Math.random().toString(36).substring(2, 8).toUpperCase();
      setGeneratedId(newId);
      setIsGenerating(false);
      toast.success('Room created successfully!');
    }, 800);
  };

  const copyLink = () => {
    const link = `${window.location.origin}/room/${generatedId}`;
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-[#0a0a0a] p-4 relative overflow-hidden font-sans">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Left side / Hero section (hidden on small mobile) */}
      <div className="hidden md:flex flex-col items-start justify-center flex-1 max-w-xl pr-12 z-10">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/30 ring-1 ring-white/10 transform -rotate-6">
          <Palette className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Create, share, and <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            draw together.
          </span>
        </h1>
        <p className="text-xl text-gray-400 mb-8 leading-relaxed">
          SyncSketch is a lightning-fast, real-time collaborative whiteboard. No sign-ups required. Just create a room and share the link.
        </p>
        <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Real-time sync</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Pressure sensitive</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Zero latency</div>
        </div>
      </div>

      {/* Right side / Action Card */}
      <div className="relative z-10 w-full max-w-[420px]">
        {/* Mobile Header (only shows on mobile) */}
        <div className="flex flex-col items-center mb-10 md:hidden">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
            <Palette className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">SyncSketch</h1>
        </div>

        <div className="bg-[#121212]/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/5 p-8 relative overflow-hidden">
          
          {/* Tabs */}
          <div className="flex bg-black/40 rounded-xl p-1 mb-8">
            <button
              type="button"
              onClick={() => setMode('join')}
              className={cn(
                "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2",
                mode === 'join' ? "bg-[#1e1e1e] text-white shadow" : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              )}
            >
              <Users className="w-4 h-4" /> Join Room
            </button>
            <button
              type="button"
              onClick={() => { setMode('create'); setGeneratedId(''); }}
              className={cn(
                "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2",
                mode === 'create' ? "bg-[#1e1e1e] text-white shadow" : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              )}
            >
              <Sparkles className="w-4 h-4" /> Create Room
            </button>
          </div>

          <form onSubmit={handleJoin} className="space-y-6">
            {/* Common Username Input */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-300 ml-1">
                Your Name
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white placeholder-gray-600 text-base"
                placeholder="e.g. John Doe"
                autoComplete="off"
              />
            </div>
            
            {mode === 'join' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <label htmlFor="roomId" className="text-sm font-medium text-gray-300 ml-1">
                  Room ID
                </label>
                <input
                  type="text"
                  id="roomId"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white placeholder-gray-600 text-base uppercase tracking-wider"
                  placeholder="Enter 6-digit code"
                  autoComplete="off"
                  maxLength={10}
                />
              </div>
            )}

            {mode === 'create' && !generatedId && (
              <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <button
                  type="button"
                  onClick={handleGenerateRoom}
                  disabled={isGenerating}
                  className="w-full py-4 px-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 border-dashed transition-all flex items-center justify-center gap-2 group"
                >
                  {isGenerating ? (
                    <><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /> Generating...</>
                  ) : (
                    <><Sparkles className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300" /> Generate New Room ID</>
                  )}
                </button>
              </div>
            )}

            {mode === 'create' && generatedId && (
              <div className="space-y-4 animate-in zoom-in-95 duration-300">
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex flex-col items-center justify-center gap-2">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Room ID Generated</span>
                  <span className="text-3xl font-bold text-white tracking-[0.2em]">{generatedId}</span>
                </div>
                
                <button
                  type="button"
                  onClick={copyLink}
                  className="w-full py-3 px-4 bg-[#1e1e1e] hover:bg-[#252525] text-gray-300 font-medium rounded-xl border border-white/5 transition-all flex items-center justify-center gap-2"
                >
                  {isCopied ? <><Check className="w-4 h-4 text-emerald-400" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Invite Link</>}
                </button>
              </div>
            )}

            {(mode === 'join' || generatedId) && (
              <button
                type="submit"
                disabled={isEntering}
                className="w-full py-4 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group mt-4 disabled:opacity-70 disabled:pointer-events-none"
              >
                {isEntering ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {mode === 'join' ? 'Enter Canvas' : 'Join as Host'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
