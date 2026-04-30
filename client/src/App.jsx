import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import JoinRoom from './pages/JoinRoom';
import CanvasRoom from './pages/CanvasRoom';
import { useEffect } from 'react';
import { socket } from './socket';
import { Toaster } from 'sonner';

function App() {
  useEffect(() => {
    // Ping backend to wake it up and avoid cold starts in production (Render, etc.)
    const backendUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    fetch(backendUrl).catch(err => console.log('Backend wake-up ping failed:', err));

    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-indigo-500/30">
        <Routes>
          <Route path="/" element={<JoinRoom />} />
          <Route path="/room/:roomId" element={<CanvasRoom />} />
        </Routes>
        <Toaster position="bottom-right" theme="dark" richColors />
      </div>
    </Router>
  );
}

export default App;
