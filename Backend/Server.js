const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const DrawingState = require('./drawing-state');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const drawingState = new DrawingState();

const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'Frontend'))); 



io.on('connection', (socket) => {
  const userId = socket.id;
  const userColor = `hsl(${Math.random() * 360}, 80%, 60%)`;
  console.log(`User connected: ${userId}`);

  socket.emit('init', { strokes: drawingState.getStrokes(), userId, userColor });
  io.emit('user-joined', { userId, color: userColor });

  socket.on('draw', (stroke) => {
    drawingState.addStroke(stroke);
    socket.broadcast.emit('draw', stroke);
  });

  socket.on('cursor', (cursorData) => {
    socket.broadcast.emit('cursor', cursorData);
  });

  socket.on('undo', () => {
    drawingState.undo();
    io.emit('update-canvas', drawingState.getStrokes());
  });

  socket.on('redo', () => {
    drawingState.redo();
    io.emit('update-canvas', drawingState.getStrokes());
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${userId}`);
    io.emit('user-left', userId);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
