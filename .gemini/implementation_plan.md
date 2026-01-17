# F1 Replay - Feature Implementation Plan

## Overview
This plan covers the implementation of 4 major features to enhance the F1 Replay application:
1. Tire Degradation Chart
2. Head-to-Head Mode
3. Driver Profiles
4. Offline Mode (PWA)

**Estimated Total Time:** 3-5 days (depending on depth)

---

## Phase 1: Tire Degradation Chart ⏱️ ~3-4 hours

### Description
A visual chart showing tire wear/performance degradation over laps for selected driver(s). Shows lap times plotted against lap number with tire compound color coding.

### Data Requirements
The telemetry data already contains per-lap information. We need to:
- [ ] Extract lap times per driver from frames
- [ ] Get tire compound info (if available in data, otherwise use placeholder)
- [ ] Calculate rolling average to smooth the curve

### Components to Create
```
web/src/components/
├── TireDegradationChart.tsx      # Main chart component (Recharts)
├── TireCompoundBadge.tsx         # S/M/H badge with colors (red/yellow/white)
└── LapTimeTable.tsx              # Optional: tabular view of lap times
```

### Implementation Steps
1. **Create chart component** using Recharts (already in dependencies)
   - X-axis: Lap number
   - Y-axis: Lap time (seconds)
   - Lines: One per selected driver
   - Markers: Show tire compound at pit stops

2. **Extract lap data** from race frames
   - Group frames by driver + lap
   - Calculate lap time = last_frame_time - first_frame_time per lap
   - Store tire compound (if available)

3. **Add to race page** as new tab alongside Track/Telemetry

4. **Styling**
   - Soft tire: Red line/markers
   - Medium tire: Yellow line/markers  
   - Hard tire: White line/markers
   - Safety car laps: Grey background bands

### Files to Modify
- `web/src/app/race/[year]/[round]/page.tsx` - Add new "Tires" tab
- `web/src/hooks/useRaceReplay.ts` - Add lap time calculation logic

---

## Phase 2: Head-to-Head Mode ⏱️ ~4-5 hours

### Description
Split-screen comparison of two drivers showing their telemetry side-by-side, with delta time tracking.

### UI Layout (Mobile + Desktop)
```
┌─────────────────────────────────────┐
│  [Driver 1 ▼]    VS    [Driver 2 ▼] │
├─────────────────┬───────────────────┤
│                 │                   │
│   Driver 1      │    Driver 2       │
│   Telemetry     │    Telemetry      │
│   - Speed       │    - Speed        │
│   - Throttle    │    - Throttle     │
│   - Brake       │    - Brake        │
│                 │                   │
├─────────────────┴───────────────────┤
│         DELTA: +0.342s              │
│         ▲ Driver 1 is ahead         │
├─────────────────────────────────────┤
│      [Shared Track Map View]        │
│      Both drivers highlighted       │
└─────────────────────────────────────┘
```

### Components to Create
```
web/src/components/
├── HeadToHeadMode.tsx          # Main container component
├── DriverComparisonCard.tsx    # Single driver's stats display
├── DeltaDisplay.tsx            # Shows time gap between drivers
└── DualTrackMap.tsx            # Track map highlighting both drivers
```

### Implementation Steps
1. **Add H2H tab/mode** to race page header
2. **Create driver selection dropdowns** (2 selectors)
3. **Calculate delta time** between drivers
   - Compare lap progress or distance traveled
   - Show + / - relative to first selected driver
4. **Split telemetry display**
   - Speed/RPM/Gear comparison
   - Throttle/Brake traces stacked
5. **Track map shows both drivers**
   - Primary driver: Solid color
   - Comparison driver: Dotted/ghost style

### Data Needed
Already available in `currentFrame.drivers[code]`:
- position, speed, rpm, gear, throttle, brake, x, y

### Mobile Adaptation
- Stack vertically instead of side-by-side
- Swipe to switch between Driver 1 / Driver 2 / Combined view

---

## Phase 3: Driver Profiles ⏱️ ~3-4 hours

### Description
Click on a driver to see their profile: photo, team, number, season stats.

### Data Source
We'll fetch from the FastF1/OpenF1 API or use static JSON. For 2025, create a static JSON file:

```json
// web/public/drivers/2025.json
{
  "VER": {
    "firstName": "Max",
    "lastName": "Verstappen",
    "team": "Red Bull Racing",
    "number": 1,
    "country": "NED",
    "countryFlag": "🇳🇱",
    "photo": "/drivers/verstappen.webp",
    "teamColor": "#3671C6",
    "stats": {
      "wins": 0,
      "podiums": 0,
      "poles": 0,
      "fastestLaps": 0
    }
  }
}
```

### Components to Create
```
web/src/components/
├── DriverProfile.tsx           # Full profile modal/panel
├── DriverProfileCard.tsx       # Mini card (in sidebar)
└── DriverPhoto.tsx             # Photo with fallback
```

### Implementation Steps
1. **Create driver data file** (`public/drivers/2025.json`)
   - Driver code → profile mapping
   - Include all 20+ drivers

2. **Download/generate driver photos**
   - Use official F1 media or generate AI headshots
   - Store in `public/drivers/`

3. **Create DriverProfile component**
   - Modal that opens when clicking driver in sidebar
   - Shows: Photo, Name, Team, Number, Country
   - Season stats (can be static or fetched)

4. **Integrate with Sidebar**
   - Add "info" icon next to driver name
   - Click opens profile modal

5. **Mobile: Bottom sheet** instead of modal

### Optional Enhancements
- Show driver's current race position
- Link to their fastest lap in current race
- Season championship points

---

## Phase 4: Offline Mode (PWA) ⏱️ ~4-5 hours

### Description
Make the app installable and work offline by caching race data.

### PWA Requirements Checklist
- [ ] Web App Manifest (`manifest.json`)
- [ ] Service Worker (for caching)
- [ ] App Icons (various sizes)
- [ ] Splash screens
- [ ] Offline fallback page

### Implementation Steps

#### Step 1: Create Web Manifest
```json
// web/public/manifest.json
{
  "name": "F1 Race Replay",
  "short_name": "F1 Replay",
  "description": "Relive F1 races with full telemetry",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#dc2626",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

#### Step 2: Install next-pwa package
```bash
npm install next-pwa
```

#### Step 3: Configure next.config.mjs
```js
import withPWA from 'next-pwa';

const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})({
  // existing next config
});
```

#### Step 4: Leverage existing IndexedDB cache
The app already uses IndexedDB for race data caching (`raceCache.ts`).
- Races viewed once are cached locally
- Works offline after first load

#### Step 5: Create offline fallback
- Show cached races when offline
- Display "Offline Mode" badge
- Disable features that require network

#### Step 6: Generate app icons
- 192x192 and 512x512 PNG icons
- Use F1 Replay logo/branding

### Files to Create/Modify
```
web/
├── public/
│   ├── manifest.json
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── offline.html
├── next.config.mjs (modify)
└── src/app/layout.tsx (add manifest link)
```

### Testing PWA
1. Build production: `npm run build && npm start`
2. Open Chrome DevTools → Application → Manifest
3. Check "Installable" status
4. Test offline in Network tab (set to Offline)

---

## Implementation Order (Recommended)

| Order | Feature | Priority | Effort |
|-------|---------|----------|--------|
| 1 | **Driver Profiles** | High | 3-4h |
| 2 | **Tire Degradation Chart** | High | 3-4h |
| 3 | **PWA/Offline Mode** | Medium | 4-5h |
| 4 | **Head-to-Head Mode** | Medium | 4-5h |

**Rationale:**
- Driver Profiles is quick and adds immediate polish
- Tire Chart uses existing data, visual impact
- PWA is infrastructure that helps all features
- H2H is most complex, save for last

---

## Quick Start Commands

```bash
# Start development
cd web && npm run dev

# Create new component
touch src/components/TireDegradationChart.tsx

# Install PWA package
npm install next-pwa

# Build and test PWA
npm run build && npm start
```

---

## Success Criteria

### Tire Degradation Chart
- [ ] Shows lap times for selected driver
- [ ] Color-coded by tire compound
- [ ] Pit stops marked clearly
- [ ] Mobile responsive

### Head-to-Head Mode
- [ ] Can select any 2 drivers
- [ ] Shows real-time delta
- [ ] Split telemetry view
- [ ] Both drivers on track map

### Driver Profiles
- [ ] All 2024/2025 drivers have profiles
- [ ] Photos load correctly
- [ ] Stats display properly
- [ ] Mobile-friendly modal

### PWA/Offline
- [ ] App is installable
- [ ] Works offline after viewing race
- [ ] Shows cached races list
- [ ] Offline indicator visible

---

## Next Steps

Ready to start? Let me know which feature you want to tackle first, and I'll implement it step by step!
