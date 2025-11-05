import { sendDraw, sendCursorMove, sendUndoRedo, getUserInfo } from "./websocket.js";

const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");


let DPR = window.devicePixelRatio || 1;


const localStrokes = []; 
const users = new Map(); 

let brushColor = "#000000";
let brushWidth = 4;
let isEraser = false;

let drawing = false;
let currentPath = []; 


let lastCursor = null;
let cursorScheduled = false;
function scheduleCursorSend(x, y) {
  lastCursor = { x, y };
  if (!cursorScheduled) {
    cursorScheduled = true;
    requestAnimationFrame(() => {
      const { x, y } = lastCursor;
      sendCursorMove(x, y);
      cursorScheduled = false;
    });
  }
}

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx*dx + dy*dy);
}


export function drawStroke(stroke) {
  if (!stroke || !stroke.points || stroke.points.length < 2) return;
  ctx.save();
  ctx.beginPath();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = stroke.color || "#000";
  ctx.lineWidth = stroke.width || 2;

  const pts = stroke.points;
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; ++i) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.stroke();
  ctx.restore();
}

function clearCanvas() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

export function redrawAll() {
  clearCanvas();

  for (const s of localStrokes) {
    drawStroke(s);
  }

  drawCursors(users);
}

export function pushRemoteStroke(stroke) {
  if (!stroke) return;

  const { userId } = getUserInfo();
  if (stroke.userId && stroke.userId === userId) {
    return;
  }

  localStrokes.push(stroke);
  drawStroke(stroke);
}


export function replaceAllStrokes(strokes) {
  localStrokes.length = 0;
  if (Array.isArray(strokes)) {
    strokes.forEach(s => localStrokes.push(s));
  }
  redrawAll();
}

export function drawCursors(map) {

  for (const [id, data] of map.entries()) {
    if (!data) continue;
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = data.color || "gray";
    ctx.arc(data.x, data.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#00000030";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
}

export function updateUserCursor(id, x, y, color) {
  users.set(id, { x, y, color, lastSeen: Date.now() });
  redrawAll();
}

export function removeUserCursor(id) {
  users.delete(id);
  redrawAll();
}


export function clearLocalStrokes() {
  localStrokes.length = 0;
  redrawAll();
}

export function getLocalStrokesCount() {
  return localStrokes.length;
}

export function setupToolbar() {
  const colorPicker = document.getElementById("colorPicker");
  const strokeWidth = document.getElementById("strokeWidth");
  const brushBtn = document.getElementById("brush");
  const eraserBtn = document.getElementById("eraser");
  const undoBtn = document.getElementById("undo");
  const redoBtn = document.getElementById("redo");

  colorPicker.addEventListener("change", (e) => brushColor = e.target.value);
  strokeWidth.addEventListener("input", (e) => brushWidth = parseInt(e.target.value, 10));
  brushBtn.addEventListener("click", () => (isEraser = false));
  eraserBtn.addEventListener("click", () => (isEraser = true));
  undoBtn.addEventListener("click", () => sendUndoRedo("undo"));
  redoBtn.addEventListener("click", () => sendUndoRedo("redo"));
}

export function setupCanvas() {
  setCanvasSize(); 
  canvas.addEventListener("mousedown", onPointerDown);
  canvas.addEventListener("mousemove", onPointerMove);
  window.addEventListener("mouseup", onPointerUp);

  canvas.addEventListener("touchstart", (e) => onPointerDown(touchToPointer(e)), { passive: false });
  canvas.addEventListener("touchmove", (e) => onPointerMove(touchToPointer(e)), { passive: false });
  window.addEventListener("touchend", (e) => onPointerUp(touchToPointer(e)), { passive: false });

  canvas.addEventListener("mouseleave", onPointerUp);

  canvas.oncontextmenu = (e) => e.preventDefault();
}

function touchToPointer(e) {
  if (!e.touches || e.touches.length === 0) {
    const t = e.changedTouches[0] || e.touches[0];
    return { clientX: t.clientX, clientY: t.clientY, isTouch: true, originalEvent: e };
  }
  const t = e.touches[0];
  return { clientX: t.clientX, clientY: t.clientY, isTouch: true, originalEvent: e };
}

function onPointerDown(e) {
  drawing = true;
  const x = e.clientX;
  const y = e.clientY;
  currentPath = [{ x, y }];
  const { userId } = getUserInfo();
  const seg = {
    id: `${userId || "local"}-${Date.now()}`,
    userId,
    color: isEraser ? "#FFFFFF" : brushColor,
    width: brushWidth,
    points: [{ x, y }, { x, y }]
  };
  localStrokes.push(seg);
  drawStroke(seg);
}

function onPointerMove(e) {
  const x = e.clientX;
  const y = e.clientY;

  if (!drawing) {
    scheduleCursorSend(x, y);
    return;
  }

  const prev = currentPath[currentPath.length - 1];
  const point = { x, y };

  if (distance(prev, point) < 2) {
    scheduleCursorSend(x, y);
    return;
  }

  const { userId } = getUserInfo();
  const segment = {
    id: `${userId || "local"}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
    userId,
    color: isEraser ? "#FFFFFF" : brushColor,
    width: brushWidth,
    points: [ prev, point ],
  };

  localStrokes.push(segment);
  drawStroke(segment);
  sendDraw(segment);

  currentPath.push(point);
  scheduleCursorSend(x, y);
}

function onPointerUp() {
  if (!drawing) return;
  drawing = false;
  currentPath = [];
}


function setCanvasSize() {
  DPR = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.round(w * DPR);
  canvas.height = Math.round(h * DPR);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  redrawAll();
}
window.addEventListener("resize", () => setCanvasSize());
