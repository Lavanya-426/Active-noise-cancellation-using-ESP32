// WebSocket connection
let ws = null;
let isConnected = false;
let lastUpdateTime = Date.now();
let updateCount = 0;
let sampleRateInterval = null;

// Connection status elements
const connectionStatus = document.getElementById("connectionStatus");
const statusDot = connectionStatus.querySelector(".status-dot");
const statusText = connectionStatus.querySelector(".status-text");

// Value display elements
const rawValueElement = document.getElementById("rawValue");
const noiseValueElement = document.getElementById("noiseValue");
const cleanValueElement = document.getElementById("cleanValue");
const noiseReductionElement = document.getElementById("noiseReduction");
const sampleRateElement = document.getElementById("sampleRate");
const updateRateElement = document.getElementById("updateRate");

// Initialize WebSocket connection
function connectWebSocket() {
  ws = new WebSocket("ws://localhost:3001");

  ws.onopen = () => {
    console.log("WebSocket connected");
    //setConnectionStatus(true);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handleMessage(data);
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  ws.onclose = () => {
    console.log("WebSocket disconnected");
    setConnectionStatus(false);
    // Attempt to reconnect after 3 seconds
    setTimeout(connectWebSocket, 3000);
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    setConnectionStatus(false);
  };
}

// Handle incoming messages
function handleMessage(data) {
  if (data.type === "signal") {
    // Update charts
    updateCharts(data.raw, data.noise, data.clean);

    // Update current values
    rawValueElement.textContent = data.raw;
    noiseValueElement.textContent = data.noise;
    cleanValueElement.textContent = data.clean;

    // Calculate noise reduction percentage
    if (data.raw > 0) {
      const reduction = ((data.noise / data.raw) * 100).toFixed(1);
      noiseReductionElement.textContent = `${reduction}%`;
    }

    // Track update rate
    updateCount++;
  } else if (data.type === "status") {
    if (data.message === "ESP32 connected") {
      setConnectionStatus(true);
    }

    if (data.message === "ESP32 disconnected") {
      setConnectionStatus(false);
    }

    console.log("Status:", data.message);
  } else if (data.type === "connected") {
    console.log(data.message);
  }
}

// Set connection status indicator
function setConnectionStatus(connected) {
  isConnected = connected;
  if (connected) {
    statusDot.classList.add("connected");
    statusText.textContent = "Connected";
    connectionStatus.classList.add("connected");
  } else {
    statusDot.classList.remove("connected");
    statusText.textContent = "Disconnected";
    connectionStatus.classList.remove("connected");
  }
}

// Calculate and display sample rate
function updateSampleRate() {
  const now = Date.now();
  const elapsed = (now - lastUpdateTime) / 1000; // seconds
  const rate = Math.round(updateCount / elapsed);

  sampleRateElement.textContent = `${rate} Hz`;
  updateRateElement.textContent = rate;

  // Reset counters
  updateCount = 0;
  lastUpdateTime = now;
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Initialize charts
  initCharts();

  // Connect WebSocket
  connectWebSocket();

  // Update sample rate every second
  sampleRateInterval = setInterval(updateSampleRate, 1000);
});

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  if (ws) {
    ws.close();
  }
  if (sampleRateInterval) {
    clearInterval(sampleRateInterval);
  }
});
