import { Server } from 'socket.io';

const rooms = {};

export default (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_room', ({ roomId, username }) => {
      // If the socket was already in a room, clean up the old room state
      if (socket.roomId && socket.roomId !== roomId) {
        handleDisconnect(socket, io);
      }

      socket.join(roomId);

      if (!rooms[roomId]) {
        // First user to join becomes the host
        rooms[roomId] = {
          host: socket.id,
          users: [{ id: socket.id, username, canDraw: true }],
          drawingEnabled: true,
          canvasBg: '#121212'
        };
      } else {
        // Prevent duplicate push
        const exists = rooms[roomId].users.find((u) => u.id === socket.id);
        if (!exists) {
          rooms[roomId].users.push({ id: socket.id, username, canDraw: true });
          
          // Request canvas state from host for the new user
          if (rooms[roomId].host) {
            io.to(rooms[roomId].host).emit('request_canvas_state', socket.id);
          }
        }
      }

      socket.roomId = roomId;
      socket.username = username;

      // Notify the room
      io.to(roomId).emit('room_data', {
        host: rooms[roomId].host,
        users: rooms[roomId].users,
        drawingEnabled: rooms[roomId].drawingEnabled,
        canvasBg: rooms[roomId].canvasBg
      });
      
      // Notify others that a user joined
      socket.to(roomId).emit('user_joined', username);
    });

    socket.on('send_canvas_state', ({ to, canvasState }) => {
      io.to(to).emit('init_canvas_state', canvasState);
    });

    socket.on('leave_room', () => {
      handleDisconnect(socket, io);
    });

    socket.on('transfer_host', (newHostId) => {
      const room = rooms[socket.roomId];
      if (room && socket.id === room.host) {
        room.host = newHostId;
        io.to(socket.roomId).emit('room_data', {
          host: room.host,
          users: room.users,
          drawingEnabled: room.drawingEnabled,
          canvasBg: room.canvasBg
        });
      }
    });

    socket.on('toggle_user_drawing', ({ userId, canDraw }) => {
      const room = rooms[socket.roomId];
      if (room && socket.id === room.host) {
        const user = room.users.find(u => u.id === userId);
        if (user) {
          user.canDraw = canDraw;
          io.to(socket.roomId).emit('room_data', {
            host: room.host,
            users: room.users,
            drawingEnabled: room.drawingEnabled,
            canvasBg: room.canvasBg
          });
        }
      }
    });

    socket.on('change_canvas_bg', (bgMode) => {
      const room = rooms[socket.roomId];
      if (room && socket.id === room.host) {
        room.canvasBg = bgMode;
        io.to(socket.roomId).emit('canvas_bg_changed', bgMode);
      }
    });

    socket.on('stroke_start', () => {
      const room = rooms[socket.roomId];
      if (room) {
        const user = room.users.find(u => u.id === socket.id);
        const hasPermission = user ? user.canDraw : false;
        if (hasPermission || socket.id === room.host) {
          socket.to(socket.roomId).emit('stroke_start');
        }
      }
    });

    socket.on('trigger_undo', () => {
      const room = rooms[socket.roomId];
      if (room) {
        const user = room.users.find(u => u.id === socket.id);
        const hasPermission = user ? user.canDraw : false;
        if (hasPermission || socket.id === room.host) {
          io.to(socket.roomId).emit('perform_undo');
        }
      }
    });

    socket.on('draw', (data) => {
      const room = rooms[socket.roomId];
      // Only broadcast if the specific user has drawing enabled, or if it's the host
      if (room) {
        const user = room.users.find(u => u.id === socket.id);
        const hasPermission = user ? user.canDraw : false;
        
        if (hasPermission || socket.id === room.host) {
          socket.to(socket.roomId).emit('draw', data);
        }
      }
    });

    socket.on('clear_canvas', () => {
      const room = rooms[socket.roomId];
      if (room && socket.id === room.host) {
        io.to(socket.roomId).emit('clear_canvas');
      }
    });

    socket.on('toggle_drawing', (enabled) => {
      const room = rooms[socket.roomId];
      if (room && socket.id === room.host) {
        room.drawingEnabled = enabled;
        
        // Update all users' individual access
        room.users.forEach(user => {
          if (user.id !== room.host) {
            user.canDraw = enabled;
          }
        });
        
        io.to(socket.roomId).emit('room_data', {
          host: room.host,
          users: room.users,
          drawingEnabled: room.drawingEnabled,
          canvasBg: room.canvasBg
        });
        io.to(socket.roomId).emit('drawing_toggled', enabled);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      handleDisconnect(socket, io);
    });
  });

  function handleDisconnect(socket, io) {
    if (socket.roomId && rooms[socket.roomId]) {
      const room = rooms[socket.roomId];
      const leavingUser = room.users.find(u => u.id === socket.id);
      if (leavingUser) {
        io.to(socket.roomId).emit('user_left', leavingUser.username);
      }

      room.users = room.users.filter((user) => user.id !== socket.id);

      if (room.users.length === 0) {
        delete rooms[socket.roomId];
      } else {
        // If the host left, reassign the host to the next user in the list
        if (room.host === socket.id) {
          room.host = room.users[0].id;
        }
        io.to(socket.roomId).emit('room_data', {
          host: room.host,
          users: room.users,
          drawingEnabled: room.drawingEnabled,
          canvasBg: room.canvasBg
        });
      }
      
      socket.leave(socket.roomId);
      socket.roomId = null;
    }
  }
};
