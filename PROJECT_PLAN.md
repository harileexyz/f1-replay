# Project Plan: F1 Race Replay Web App (Next.js + Firebase)

## 1. Architecture Overview

Since `FastF1` is a Python library, we cannot run the data extraction directly in the browser. We will use a **Serverless / Pre-computation** approach.

### **The "Hybrid" Backend**
1.  **Data Processing (Python Local/Cloud Script)**:
    *   We will modify your current Python code to act as an "Ingestion Engine".
    *   Instead of opening an Arcade window, it will process the race data into a lightweight JSON format.
    *   It effectively calculates the "frames" for the entire race once.
2.  **Storage (Firebase Storage)**:
    *   The processed JSON files (telemetry) will be uploaded here.
    *   *Why?* Race data can be 5-20MB+. Firestore has a 1MB limit per document. Storage handles large files cheaply.
3.  **Database (Firebase Firestore)**:
    *   Stores metadata: `Year`, `Round`, `Grand Prix Name`, `Driver List`, and the `Download URL` for the JSON file in Storage.

### **The Frontend (Next.js)**
*   **Race Selector**: Fetches available races from Firestore.
*   **Replay Engine**: Fetches the JSON file from Storage and uses HTML5 Canvas to render the frames (replacing `Arcade`).

---

## 2. Phase 1: Data Pipeline (Python -> Firebase)

**Goal:** Create a script that processes a race and uploads it to the cloud.

1.  **Setup Firebase Admin in Python**:
    *   Install `firebase-admin` in your `venv`.
    *   Set up a Firebase Project and generate a Service Account Key.
2.  **Modify `f1_data.py` (JSON Exporter)**:
    *   Create a function `export_race_to_json(year, round)` that returns the `frames` list and `track_layout` as a standard Python dict (no NumPy types).
    *   *Task:* Ensure `numpy` arrays are converted to Python lists (JSON doesn't understand `numpy`).
3.  **Create `upload_race.py`**:
    *   A CLI script usage: `python upload_race.py --year 2025 --round 12`.
    *   **Step 1:** Run `export_race_to_json`.
    *   **Step 2:** Save result as `temp.json`.
    *   **Step 3:** Upload `temp.json` to Firebase Storage (`races/{year}/{round}/telemetry.json`).
    *   **Step 4:** Write a document to Firestore collection `races`:
        ```json
        {
          "id": "2025-12",
          "name": "British Grand Prix",
          "year": 2025,
          "round": 12,
          "telemetryUrl": "https://storage.googleapis.com/..."
        }
        ```

## 3. Phase 2: Frontend Setup (Next.js)

**Goal:** Basic web app that connects to Firebase.

1.  **Initialize Project**:
    *   `npx create-next-app@latest f1-web-replay`.
    *   Install `firebase` (client SDK).
2.  **Firebase Config**:
    *   Create `src/lib/firebase.js` to initialize the app.
3.  **Home Page**:
    *   Query Firestore `races` collection.
    *   Display a grid of available races (like your current CLI menu, but visual).

## 4. Phase 3: The Web Replay Engine

**Goal:** Recreate the `Arcade` visualization in the Browser.

1.  **Data Fetching**:
    *   On the `/race/[id]` page, fetch the JSON file using the URL from Firestore.
2.  **Canvas Component (`<RaceTrack />`)**:
    *   Use the **HTML5 Canvas API**.
    *   **Coordinate mapping:** logic from `world_to_screen` in `arcade_replay.py` needs to be ported to JavaScript.
    *   **The Loop:** Use `requestAnimationFrame` to drive the animation.
3.  **Playback Logic**:
    *   State: `isPlaying`, `playbackSpeed`, `currentTime`.
    *   Logic: Update `currentTime` by `delta * speed`. Find the correct frame index. Draw dots.

## 5. Phase 4: UI & Telemetry

**Goal:** Add the "Premium" feel.

1.  **Leaderboard Sidebar**:
    *   React Component updated every frame based on the current data slice.
2.  **Telemetry Charts**:
    *   Use **Recharts** (React library) for the Throttle/Brake/Speed graphs.
    *   Much easier than drawing graphs manually on Canvas.
3.  **Controls**:
    *   Play/Pause buttons, scrub bar (slider).

---

## 6. Implementation Checklist

### Python Side
- [ ] Create `scripts/serialize_data.py` (Numpy to JSON converter).
- [ ] Create `scripts/upload_to_firebase.py`.
- [ ] Test uploading one race.

### Next.js Side
- [ ] Setup `create-next-app`.
- [ ] Build `RaceCard` component.
- [ ] Build `RaceReplay` page.
- [ ] Port `world_to_screen` logic to JS.
- [ ] Implement `useRaceLoop` hook (custom hook to manage the timer).

## 7. Migration Guide (Porting Logic)

| Concept | Python (Current) | JavaScript (Next.js) |
| :--- | :--- | :--- |
| **Game Loop** | `arcade.Window.on_update` | `requestAnimationFrame` loop |
| **Drawing** | `arcade.draw_circle_filled` | `ctx.beginPath(); ctx.arc(...); ctx.fill()` |
| **Data Struct** | Pandas DataFrame / NumPy | JSON Array of Objects |
| **State** | Class instance variables | React `useState` / `useRef` |
