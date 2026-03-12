// Chart configuration
const BUFFER_SIZE = 100;
const CHART_UPDATE_MS = 50; // Update charts every 50ms

// Data buffers
const rawBuffer = new Array(BUFFER_SIZE).fill(0);
const noiseBuffer = new Array(BUFFER_SIZE).fill(0);
const cleanBuffer = new Array(BUFFER_SIZE).fill(0);
const labels = new Array(BUFFER_SIZE).fill("");

// Chart instances
let rawChart = null;
let noiseChart = null;
let cleanChart = null;

// Chart configuration template
const chartConfig = {
  type: "line",
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0,
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: "#374151",
          lineWidth: 0.5,
        },
        ticks: {
          display: false,
        },
      },
      y: {
        display: true,
        min: 0,
        max: 4095, // 12-bit ADC range
        grid: {
          color: "#374151",
          lineWidth: 0.5,
        },
        ticks: {
          color: "#9ca3af",
          stepSize: 1000,
          callback: function (value) {
            return value;
          },
        },
      },
    },
    elements: {
      line: {
        borderWidth: 2,
        tension: 0.1,
      },
      point: {
        radius: 0,
      },
    },
  },
};

// Initialize all charts
function initCharts() {
  // Raw Signal Chart
  const rawCtx = document.getElementById("rawChart").getContext("2d");
  rawChart = new Chart(rawCtx, {
    ...chartConfig,
    data: {
      labels: labels,
      datasets: [
        {
          data: rawBuffer,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
        },
      ],
    },
  });

  // Noise Signal Chart
  const noiseCtx = document.getElementById("noiseChart").getContext("2d");
  noiseChart = new Chart(noiseCtx, {
    ...chartConfig,
    data: {
      labels: labels,
      datasets: [
        {
          data: noiseBuffer,
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          fill: true,
        },
      ],
    },
  });

  // Clean Signal Chart
  const cleanCtx = document.getElementById("cleanChart").getContext("2d");
  cleanChart = new Chart(cleanCtx, {
    ...chartConfig,
    data: {
      labels: labels,
      datasets: [
        {
          data: cleanBuffer,
          borderColor: "#22c55e",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          fill: true,
        },
      ],
    },
  });
}

// Update charts with new data
function updateCharts(rawValue, noiseValue, cleanValue) {
  // Shift buffers and add new values
  rawBuffer.shift();
  rawBuffer.push(rawValue);

  noiseBuffer.shift();
  noiseBuffer.push(noiseValue);

  cleanBuffer.shift();
  cleanBuffer.push(cleanValue);

  // Update chart data
  if (rawChart) {
    rawChart.data.datasets[0].data = [...rawBuffer];
    rawChart.update("none");
  }

  if (noiseChart) {
    noiseChart.data.datasets[0].data = [...noiseBuffer];
    noiseChart.update("none");
  }

  if (cleanChart) {
    cleanChart.data.datasets[0].data = [...cleanBuffer];
    cleanChart.update("none");
  }
}

// Auto-scale charts based on data range
function autoScaleCharts() {
  const allValues = [...rawBuffer, ...noiseBuffer, ...cleanBuffer];
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);

  // Add some padding
  const range = maxValue - minValue;
  const padding = range * 0.1;

  const yMin = Math.max(0, minValue - padding);
  const yMax = Math.min(4095, maxValue + padding);

  // Update all chart scales
  [rawChart, noiseChart, cleanChart].forEach((chart) => {
    if (chart) {
      chart.options.scales.y.min = yMin;
      chart.options.scales.y.max = yMax;
    }
  });
}

// Optional: Auto-scale every 2 seconds
setInterval(() => {
  // Uncomment to enable auto-scaling
  // autoScaleCharts();
}, 2000);
