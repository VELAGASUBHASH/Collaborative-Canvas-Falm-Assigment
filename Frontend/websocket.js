import { pushRemoteStroke, replaceAllStrokes, updateUserCursor, removeUserCursor } from "./canvas.js";

let socket;
let userColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
let userId = null;
const users = new Map();

export function connectWebSocket() {
  socket = io("https://collaborative-canvas-falm-assigment.onrender.com/", {
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("✅ socket connected", socket.id);
    userId = socket.id;
  });

  socket.on("init", (data) => {
    console.log("INIT data from server:", data);
    if (data.userId) userId = data.userId;
    if (data.userColor) userColor = data.userColor;
    replaceAllStrokes(data.strokes || []);
    if (Array.isArray(data.users)) {
      data.users.forEach(u => {
        if (u.userId && u.color) users.set(u.userId, u);
      });
    }
  });

  socket.on("draw", (stroke) => {
    if (!stroke) return;
    if (stroke.userId && stroke.userId === userId) return;
    pushRemoteStroke(stroke);
  });

  socket.on("update-canvas", (strokes) => {
    console.log("update-canvas from server; strokes length:", (strokes || []).length);
    replaceAllStrokes(strokes || []);
  });

  socket.on("cursor", (data) => {
    if (!data || !data.userId) return;
    if (data.userId === userId) return;
    users.set(data.userId, data);
    updateUserCursor(data.userId, data.x, data.y, data.color);
  });

  socket.on("user-left", (idOrObj) => {
    const id = typeof idOrObj === "string" ? idOrObj : (idOrObj && idOrObj.userId);
    if (id) {
      users.delete(id);
      removeUserCursor(id);
    }
  });

  socket.on("disconnect", (reason) => {
    console.warn("socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("connect_error", err);
  });
}

export function sendDraw(stroke) {
  if (!socket || !socket.connected) return;
  const payload = { ...stroke, userId, color: stroke.color || userColor };
  socket.emit("draw", payload);
}

export function sendCursorMove(x, y) {
  if (!socket || !socket.connected) return;
  socket.emit("cursor", { userId, x, y, color: userColor });
}

export function sendUndoRedo(action) {
  if (!socket || !socket.connected) return;
  socket.emit(action); 
}

export function getUserInfo() {
  return { userId, userColor };
}
