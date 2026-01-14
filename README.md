# 🏎️ F1 Race Replay & Telemetry Suite

A high-performance web application designed for Formula 1 enthusiasts and data analysts. This project visualizes real-time race telemetry, track positions, and driver performance with professional-grade precision.

![F1 Replay Banner](https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&q=80&w=2000)

## 🚀 Core Features

### 📡 Pro Telemetry Analysis
*   **Stacked Lane View**: View Speed, Throttle, and Brake data in distinct, synced vertical lanes—just like the professional F1 broadcast tools.
*   **Flicker-Free Streaming**: Optimized Recharts implementation with stabilized data windowing for a buttery-smooth 10FPS playback.
*   **Interactive Seeking**: Click anywhere on the telemetry graph to jump the replay to that exact moment in the race.

### 👻 Ghost Driver Comparison
*   **Performance Benchmarking**: Select any two drivers on the grid to overlay their telemetry.
*   **Dynamic Overlays**: The "Ghost" driver appears as a semi-transparent dashed curve, allowing you to spot exactly where time is being gained or lost in every corner.
*   **Dual HUD**: Live telemetry values for both primary and ghost drivers updating in real-time.

### 📍 Interactive Track Mapping
*   **Real-time Positioning**: Watch all 20 cars move across a high-fidelity track layout extracted from the fastest lap of the session.
*   **Selection HUD**: Click a car on the map to focus your sidebar and telemetry on that specific driver.
*   **Track Status Alerts**: Real-time indicators for Yellow Flags, Safety Cars, and VSC periods.

### 🛠️ High-Efficiency Data Pipeline
*   **Optimized Telemetry**: Custom Python engine that compresses massive raw F1 datasets (600MB+) into lightweight, web-optimized streams (~150MB).
*   **Client-Side Sorting**: Smart sorting algorithms that handle race positions in memory, ensuring the leaderboard is always accurate.

---

## 🛠️ Tech Stack

### **Frontend**
*   **Framework**: Next.js 14 (App Router)
*   **Styling**: Tailwind CSS (Modern Dark Aesthetic)
*   **Visualization**: Recharts & HTML5 Canvas
*   **State Management**: Custom React Hooks for Playback Engine

### **Backend & Data**
*   **Language**: Python (FastF1, Pandas, NumPy)
*   **Database**: Firebase Firestore (Race Metadata)
*   **Storage**: Firebase Storage (Telemetry JSON payloads)
*   **Authentication**: Firebase Admin SDK

---

## 🏗️ Getting Started

### 1. Prerequisites
*   Node.js 18+
*   Python 3.9+
*   Firebase Project (with Firestore & Storage enabled)

### 2. Installation
```bash
# Install Web Dependencies
cd web
npm install

# Install Python Dependencies
pip install fastf1 pandas firebase-admin
```

### 3. Data Ingestion
To upload a specific race to your platform:
```bash
python scripts/upload_race.py --year 2024 --round 1 --credentials firebase-key.json
```

### 4. Run Locally
```bash
cd web
npm run dev
```
Visit `http://localhost:3000` to view the grid.

---

## 📂 Project Structure
*   `/web`: Next.js application source.
*   `/src`: Core Python logic for F1 data processing.
*   `/scripts`: Utility scripts for Firebase management and data uploads.
*   `/computed_data`: Local cache for processed telemetry.

---

## 🤝 Contribution
Contributions are welcome! If you have ideas for new F1 visualizations or AWS-style "Battle" insights, feel free to open a PR.

*Built with passion for the sport by [Your Name/Handle].*
