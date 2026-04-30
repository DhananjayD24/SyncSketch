# 🎨 SyncSketch

**SyncSketch** is a lightning-fast, real-time collaborative drawing platform that allows users to instantly create rooms, invite friends, and sketch together with zero latency. It features a modern glassmorphic UI, robust host controls, and iPad-like pressure sensitivity.

---

## ✨ Features

- **Real-Time Collaboration**: Instant syncing across all clients in the room using WebSockets.
- **No Sign-ups Required**: Create a room instantly, grab a secure link, and start drawing.
- **iPad/Stylus Pressure Sensitivity**: Brush thickness dynamically adapts to the pressure of your stylus or touch, offering a natural drawing feel.
- **Robust Admin Controls**: 
  - The creator of the room acts as the Host.
  - Hosts can globally disable/enable drawing or revoke/grant drawing permissions for specific users.
  - Hosts can transfer admin rights and change the universal canvas background color.
- **Infinite Color Grids**: Full RGB/Hex color pickers for both the drawing brush and the room's canvas background.
- **Global Undo System**: A fully synchronized undo history. If anyone clicks Undo, the canvas rolls back perfectly for everyone in the room.
- **Modern Glassmorphism UI**: Beautifully crafted dark-mode interfaces, smooth animations, and ShadCn-inspired toast notifications.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: `react-router-dom`
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: `lucide-react`
- **Notifications**: `sonner`
- **Real-time Engine**: `socket.io-client`

### Backend (Server)
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: `express`
- **Real-time Engine**: `socket.io`
- **Environment**: `dotenv`

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <your-repo-url>
   cd SyncSketch
   ```

2. **Set up the Server**:
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory:
   ```env
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   ```
   Start the backend:
   ```bash
   npm start
   ```

3. **Set up the Client**:
   Open a new terminal window:
   ```bash
   cd client
   npm install
   ```
   Create a `.env` file in the `client` directory:
   ```env
   VITE_SERVER_URL=http://localhost:3001
   ```
   Start the frontend:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:5173` to view the application!

---

## 🏗️ Architecture & Mechanics

- **State Syncing**: Instead of broadcasting coordinate arrays (which can lag), SyncSketch transmits efficient rendering coordinates (`x, y, prevX, prevY`) and periodically syncs base64 image data for perfect canvas state replication (such as when new users join).
- **Graceful Handoffs**: If the room host leaves, the server automatically promotes the next oldest user in the room to Admin. 
- **Drawing Optimizations**: Emits are throttled slightly to reduce network strain while maintaining 60FPS-like visual fidelity. Hover pointers use `mix-blend-mode: difference` to remain visible across all canvas colors.

---

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
