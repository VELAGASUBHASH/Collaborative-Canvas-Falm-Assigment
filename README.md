# Collaborative-Canvas-Falm-Assigment
🎨 Collaborative Canvas — FALM Assignment

A real-time collaborative drawing application where multiple users can draw simultaneously on the same shared canvas — featuring brush, eraser, color picker, stroke width, undo/redo, and live cursor tracking.

Built with Node.js, Express, Socket.IO, and Vanilla JavaScript using the HTML5 Canvas API.

Live Preview - https://collaborative-canvas-falm-assigment.onrender.com/

🚀 Features

✅ Real-Time Drawing — see everyone’s strokes as they happen
✅ Brush & Eraser Tools — switch between drawing and erasing easily
✅ Color Picker & Adjustable Stroke Width
✅ Undo / Redo — synchronized across all connected users
✅ Live Cursor Indicators — shows where each user is drawing
✅ Unique Colors for Each User
✅ Simple & Responsive UI

🧱 Tech Stack
Layer	Technology Used
Frontend	HTML5, CSS3, Vanilla JavaScript, Canvas API
Backend	Node.js, Express.js, Socket.IO
Realtime Communication	WebSockets (Socket.IO)
Deployment	Render
📁 Project Structure
FALM ASSIGNMENT/
├── Backend/
│   ├── node_modules/
│   ├── drawing-state.js
│   ├── rooms.js
│   ├── Server.js
│   ├── package.json
│   └── package-lock.json
├── Frontend/
│   ├── index.html
│   ├── style.css
│   ├── main.js
│   ├── canvas.js
│   └── websocket.js
└── README.md

⚙️ Setup & Run Locally
1️⃣ Navigate to the Backend folder
cd Backend

2️⃣ Install dependencies
npm install

3️⃣ Start the server
npm start

4️⃣ Open in browser

Visit:

http://localhost:3000


🧩 Open the same URL in two browser tabs → draw in one tab and watch it appear live in the other!

☁️ Deploying on Render
🔧 Deployment Configuration

Since your package.json is inside the Backend/ folder, use these settings:

Setting	Value
Root Directory	Backend
Build Command	npm install
Start Command	npm start
Environment	Node
Instance Type	Free
🪄 Steps to Deploy

Push your entire folder (including Backend and Frontend) to GitHub.

Go to Render.com
 → New → Web Service.

Connect your GitHub repository.

Configure using the table above.

Click Create Web Service.

Wait for Render to build & deploy your app.

Visit your live URL — your collaborative canvas should now be online 🎉.

🧠 How It Works (Architecture Overview)
🧩 Event Flow
Action	Event	Description
User starts drawing	draw	Client sends stroke data to the server
Server receives draw	io.emit('draw', stroke)	Broadcasts stroke to all clients
User undoes	undo	Server updates global state & re-syncs canvas
User redoes	redo	Restores stroke from undo stack
Cursor move	cursor	Broadcasts live cursor position
User joins	init	Sends existing strokes + user color
User leaves	user-left	Removes user cursor from canvas
🧩 Undo/Redo Strategy

The server maintains two arrays:

strokes[] → Active strokes on the canvas

undone[] → Temporarily removed strokes

On undo: move the last stroke from strokes → undone
On redo: move the last undone stroke back to strokes
Then broadcast the updated strokes to all users with update-canvas.

🧩 Example Flow
User A draws → emits 'draw'
Server → stores stroke → emits 'draw' to others
User B sees stroke in real time
User A clicks Undo → server updates state → broadcasts 'update-canvas'
All users see updated canvas instantly

⚙️ Key Files
File	Description
Backend/Server.js	Express server + Socket.IO handling
Backend/drawing-state.js	Handles undo/redo & stroke memory
Frontend/canvas.js	Canvas rendering & event capture
Frontend/websocket.js	WebSocket (Socket.IO) client logic
Frontend/main.js	Initializes toolbar, canvas, and socket
⚠️ Known Limitations

No authentication (shared public canvas).

Canvas state resets when server restarts (not persistent).

Performance may degrade slightly with 50+ concurrent users.

💡 Future Enhancements

Add multi-room support (private drawing sessions).

Add persistent storage (MongoDB or Redis).

Touchscreen & mobile device support.

Export canvas as PNG.

Add shape tools (line, rectangle, circle).

👨‍💻 Author

Velag Subhash
💻 Full Stack Developer | Passionate about Real-Time Web Apps
📧 velagasubhash03@gmail.com



