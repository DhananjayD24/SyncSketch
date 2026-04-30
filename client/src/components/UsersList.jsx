import { Crown, User } from 'lucide-react';

export default function UsersList({ users, hostId, isHost, onTransferHost, onToggleUserDrawing }) {
  return (
    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 sticky top-0 bg-[#1e1e1e] py-1">
        Members ({users.length})
      </h3>
      <div className="space-y-1">
        {users.map((user) => (
          <div 
            key={user.id} 
            className="flex items-center gap-2.5 p-2 rounded-lg bg-black/20 border border-white/5"
          >
            <div className="relative shrink-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-inner">
                <span className="text-xs font-bold text-white">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              {user.id === hostId && (
                <div className="absolute -top-1.5 -right-1.5 bg-amber-500 rounded-full p-0.5 shadow-sm border border-[#1e1e1e]">
                  <Crown className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            <span className="text-sm text-gray-300 font-medium truncate flex-1">
              {user.username}
            </span>
            {isHost && user.id !== hostId && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onToggleUserDrawing(user.id, !user.canDraw)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    user.canDraw 
                      ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40' 
                      : 'bg-red-500/20 text-red-400 hover:bg-red-500/40'
                  }`}
                  title={user.canDraw ? "Revoke Drawing" : "Allow Drawing"}
                >
                  {user.canDraw ? "Allowed" : "Denied"}
                </button>
                <button
                  onClick={() => onTransferHost(user.id)}
                  className="text-xs bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/40 px-2 py-1 rounded transition-colors"
                  title="Make Admin"
                >
                  Admin
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
