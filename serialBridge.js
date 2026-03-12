const express = require("express");
const WebSocket = require("ws");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const path = require("path");

// Configuration
const SERIAL_PORT = "COM3";
const BAUD_RATE = 115200;
const WEB_PORT = 3000;
const WS_PORT = 3001;

// Express server setup
const app = express();
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const server = app.listen(WEB_PORT, () => {
  console.log(`Web server running on http://localhost:${WEB_PORT}`);
});

// WebSocket server setup
const wss = new WebSocket.Server({ port: WS_PORT });
console.log(`WebSocket server running on ws://localhost:${WS_PORT}`);

// Track connected clients
let wsClients = new Set();

wss.on("connection", (ws) => {
  console.log("New WebSocket client connected");
  wsClients.add(ws);

  // Send initial connection message
  ws.send(
    JSON.stringify({
      type: "connected",
      message: "Connected to ESP32 Signal Monitor",
    }),
  );

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
    wsClients.delete(ws);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
    wsClients.delete(ws);
  });
});

// Broadcast data to all connected clients
function broadcastData(data) {
  const message = JSON.stringify(data);
  wsClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Serial port setup
let port = null;
let parser = null;

function connectSerial() {
  try {
    port = new SerialPort({
      path: SERIAL_PORT,
      baudRate: BAUD_RATE,
      autoOpen: false,
    });

    parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

    port.open((err) => {
      if (err) {
        console.error("Error opening serial port:", err.message);
        console.log("Retrying in 5 seconds...");
        setTimeout(connectSerial, 5000);
        return;
      }
      console.log(`Serial port ${SERIAL_PORT} opened at ${BAUD_RATE} baud`);
      broadcastData({ type: "status", message: "ESP32 connected" });
    });

    // Handle incoming serial data
    parser.on("data", (line) => {
      try {
        // Parse CSV format: raw_signal,noise_signal,clean_signal
        const values = line.trim().split(",");

        if (values.length === 3) {
          const data = {
            type: "signal",
            timestamp: Date.now(),
            raw: parseInt(values[0]) || 0,
            noise: parseInt(values[1]) || 0,
            clean: parseInt(values[2]) || 0,
          };

          // Broadcast to all WebSocket clients
          broadcastData(data);
        }
      } catch (error) {
        console.error("Error parsing serial data:", error);
      }
    });

    port.on("error", (err) => {
      console.error("Serial port error:", err.message);
      broadcastData({ type: "status", message: "ESP32 disconnected" });
    });

    port.on("close", () => {
      console.log("Serial port closed. Attempting to reconnect...");
      broadcastData({ type: "status", message: "ESP32 disconnected" });
      setTimeout(connectSerial, 5000);
    });
  } catch (error) {
    console.error("Failed to initialize serial port:", error);
    console.log("Retrying in 5 seconds...");
    setTimeout(connectSerial, 5000);
  }
}

// Start serial connection
connectSerial();

// List available serial ports (helpful for debugging)
SerialPort.list().then((ports) => {
  console.log("Available serial ports:");
  ports.forEach((port) => {
    console.log(`  ${port.path} - ${port.manufacturer || "Unknown"}`);
  });
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down...");
  if (port && port.isOpen) {
    port.close();
  }
  wss.close();
  server.close();
  process.exit();
});

broadcastData({
  type: "status",
  message: "ESP32 disconnected",
});
setInterval(() => {
  broadcastData({
    type: "signal",
    timestamp: Date.now(),
    raw: Math.floor(Math.random() * 4095),
    noise: Math.floor(Math.random() * 1000),
    clean: Math.floor(Math.random() * 3000),
  });
}, 100);
