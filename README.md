# F1 Race Replay & Telemetry Suite

A high-fidelity spatial telemetry visualization platform for Formula 1. This project combines a high-performance Python data pipeline with a modern React/Next.js 3D visualization engine to replay F1 sessions with real-time telemetry data.

## 🚀 Architecture

- **Frontend**: Next.js 14, React Three Fiber (3D engine), Tailwind CSS.
- **Data Pipeline**: Python + FastF1 for processing raw telemetry and weather data.
- **Backend/Storage**: Firebase Firestore (Race Metadata) & Firebase Storage (Telemetry JSON).

## 🛠 Project Structure

- `/web`: The Next.js application.
- `/src`: Core Python logic for telemetry interpolation and processing.
- `/scripts`: Deployment and data ingestion scripts.
- `/computed_data`: Local cache for processed telemetry (gitignored).

## 🚦 Getting Started

### 1. Web Application
```bash
cd web
npm install
npm run dev
```

### 2. Data Pipeline (Ingestion)
To process a new race and upload it to your web application:
```bash
# Install dependencies
pip install -r requirements.txt

# Process and Upload (Year & Round)
python scripts/upload_race.py --year 2025 --round 1
```

## 🔐 Configuration
Ensure you have a `firebase-key.json` in the root directory and a `.env.local` in the `web` directory with your Firebase configuration.
