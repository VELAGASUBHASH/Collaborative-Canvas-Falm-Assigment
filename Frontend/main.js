import { setupToolbar, setupCanvas } from "./canvas.js";
import { connectWebSocket } from "./websocket.js";

window.addEventListener("load", () => {
  console.log("🎨 Initializing Collaborative Canvas...");
  setupToolbar();
  setupCanvas();
  connectWebSocket();
});
