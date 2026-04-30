import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import setupSocket from './socket.js';

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST']
}));

app.get('/', (req, res) => {
  res.send('SyncSketch API is running');
});

setupSocket(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
