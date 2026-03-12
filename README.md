# Active Noise Cancellation using ESP32

## Project Overview

This project visualizes sound data from an ESP32 microphone in real time.
The ESP32 sends audio data through serial communication, and a Node.js backend processes the data and streams it to a web dashboard where live charts display the noise levels.

The goal of this project is to explore noise analysis and concepts related to active noise cancellation using ESP32 and web-based visualization.

---

## Features

* Real-time noise data visualization
* Serial communication with ESP32
* Interactive web dashboard
* Dynamic charts using JavaScript
* Lightweight Node.js backend

---

## Project Structure

Active-noise-cancellation-using-ESP32

public
charts.js – chart rendering logic
dashboard.js – dashboard functionality
index.html – web interface
style.css – UI styling

serialBridge.js – Node.js serial communication with ESP32
package.json – project dependencies
package-lock.json
README.md

---

## Installation

Clone the repository

git clone https://github.com/Lavanya-426/Active-noise-cancellation-using-ESP32.git

Navigate into the project

cd Active-noise-cancellation-using-ESP32

Install dependencies

npm install

Run the server

node serialBridge.js

---

## Technologies Used

ESP32
Node.js
JavaScript
HTML
CSS
Serial Communication

---

## Future Improvements

* Implement advanced noise filtering algorithms
* Add frequency spectrum visualization
* Improve dashboard UI & responsiveness
* Enable data logging for noise analysis

---

## Author

Lavanya
