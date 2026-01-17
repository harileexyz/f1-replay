# F1 Drivers & Cars Hub - Implementation Plan

## Overview
Expand the F1 Race Replay app into a comprehensive F1 hub with driver profiles, car details, and team information.

## Data Sources

### Primary: OpenF1 API (Free)
- **Drivers endpoint**: `https://api.openf1.org/v1/drivers?session_key=latest`
  - Returns: `driver_number`, `full_name`, `team_name`, `team_colour`, `headshot_url`, `country_code`
- **Sessions**: For getting latest data context

### Supplementary: Wikipedia/Wikimedia Commons
- Car images (CC licensed)
- Team logos

## Firebase Collections

### `drivers` Collection
```typescript
{
  id: string;              // "max_verstappen"
  driver_number: number;   // 1
  full_name: string;       // "Max Verstappen"
  first_name: string;      // "Max"
  last_name: string;       // "Verstappen"
  team_id: string;         // "red_bull"
  team_name: string;       // "Red Bull Racing"
  country_code: string;    // "NED"
  headshot_url: string;    // URL to driver photo
  bio: string;             // Short biography
  stats: {
    championships: number;
    race_wins: number;
    podiums: number;
    poles: number;
  };
  season: number;          // 2024
  updated_at: Timestamp;
}
```

### `teams` Collection
```typescript
{
  id: string;              // "red_bull"
  name: string;            // "Red Bull Racing"
  full_name: string;       // "Oracle Red Bull Racing"
  base: string;            // "Milton Keynes, UK"
  team_principal: string;  // "Christian Horner"
  color: string;           // "#3671C6"
  logo_url: string;        // URL to team logo
  season: number;          // 2024
}
```

### `cars` Collection
```typescript
{
  id: string;              // "rb20"
  team_id: string;         // "red_bull"
  name: string;            // "RB20"
  season: number;          // 2024
  image_url: string;       // URL to car image
  specs: {
    engine: string;        // "Honda RBPT"
    chassis: string;       // "RB20"
    weight: string;        // "798 kg"
    power_unit: string;    // "RBPTH002"
  };
}
```

## Routes Structure

```
/                    - Home (F1 Hub landing page)
├── /drivers         - All drivers grid
│   └── /drivers/[id] - Individual driver profile
├── /teams           - All teams
│   └── /teams/[id]   - Team details with car
├── /race/[year]/[round] - Race replay (existing)
└── /standings       - Championship standings (future)
```

## UI Components

### New Pages
1. **Home Page** (redesigned)
   - Hero section with current season
   - Featured driver spotlight
   - Quick links to Drivers, Teams, Race Replays
   
2. **Drivers Page** (`/drivers`)
   - Grid of driver cards
   - Filter by team
   - Click to view profile

3. **Driver Profile** (`/drivers/[id]`)
   - Large headshot
   - Stats dashboard
   - Career highlights
   - Current car/team info

4. **Teams Page** (`/teams`)
   - Team cards with colors
   - Both drivers shown
   - Link to car details

### New Components
- `DriverCard` - Card with photo, number, name, team
- `TeamCard` - Team logo, color, drivers
- `CarShowcase` - 3D or image of car with specs
- `StatsGrid` - Wins, podiums, championships
- `NavBar` - Global navigation

## Implementation Steps

### Phase 1: Data Setup
1. Create Firebase collections schema
2. Build script to fetch from OpenF1 and populate Firebase
3. Create data fetching hooks

### Phase 2: UI Components
1. Create shared components (DriverCard, TeamCard)
2. Build Drivers page
3. Build Driver profile page
4. Build Teams page

### Phase 3: Navigation
1. Redesign home page as hub
2. Add global navigation
3. Ensure race replay isn't affected

### Phase 4: Enhancement
1. Add search functionality
2. Add championship standings
3. Add schedule/calendar
