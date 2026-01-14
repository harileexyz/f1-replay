/**
 * F1 Race Replay Data Types
 * 
 * These interfaces match the JSON schema exported by scripts/upload_race.py
 */

/**
 * Telemetry data for a single driver at a single frame
 */
export interface DriverData {
  /** X coordinate in meters (world coordinates) */
  x: number;
  /** Y coordinate in meters (world coordinates) */
  y: number;
  /** Speed in km/h */
  speed: number;
  /** Throttle percentage (0-100) */
  throttle: number;
  /** Brake percentage (0-100) */
  brake: number;
  /** Current gear (1-8) */
  gear: number;
  /** Engine RPM */
  rpm: number;
  /** DRS status (>= 10 means active) */
  drs: number;
  /** Race distance covered in meters */
  dist?: number;
  /** Relative distance on track (0-1) */
  rel_dist?: number;
  /** Current lap number */
  lap?: number;
  /** Position in race */
  position?: number;
  /** Tyre compound as integer */
  tyre?: number;
}

/**
 * Weather snapshot for a frame
 */
export interface WeatherData {
  track_temp: number | null;
  air_temp: number | null;
  humidity: number | null;
  wind_speed: number | null;
  wind_direction: number | null;
  rain_state: "DRY" | "RAINING";
}

/**
 * A single frame of race data
 */
export interface Frame {
  /** Time in seconds from race start */
  t: number;
  /** Current lap (leader's lap) */
  lap: number;
  /** Driver telemetry keyed by driver code (e.g., "VER", "HAM") */
  drivers: Record<string, DriverData>;
  /** Optional weather data */
  weather?: WeatherData;
}

/**
 * Track status period (safety car, VSC, red flag, etc.)
 */
export interface TrackStatus {
  /** Status code: "1" (Green), "2" (Yellow), "4" (SC), "5" (Red), "6" (VSC), "7" (VSC Ending) */
  status: string;
  /** Start time in seconds */
  start_time: number;
  /** End time in seconds (null if ongoing) */
  end_time: number | null;
}

/**
 * RGB color as a tuple [R, G, B]
 */
export type RGBColor = [number, number, number];

/**
 * Race metadata
 */
export interface RaceMetadata {
  year: number;
  round: number;
  event_name: string;
  session_type: "R" | "S" | "Q" | "SQ";
  exported_at: string;
}

/**
 * Complete race data structure
 */
export interface RaceData {
  /** Array of telemetry frames */
  frames: Frame[];
  /** Track layout points (X, Y) */
  track_layout?: { x: number, y: number }[];
  /** Track status periods */
  track_statuses: TrackStatus[];
  /** Driver colors keyed by driver code */
  driver_colors: Record<string, RGBColor>;
  /** Total number of laps */
  total_laps?: number;
  /** Race metadata */
  metadata?: RaceMetadata;
}

/**
 * Playback state for the race replay
 */
export interface PlaybackState {
  /** Whether the replay is currently playing */
  isPlaying: boolean;
  /** Current frame index */
  currentFrameIndex: number;
  /** Current time in seconds */
  currentTime: number;
  /** Playback speed multiplier */
  playbackSpeed: number;
  /** Currently selected driver code */
  selectedDriver: string | null;
  /** Currently selected comparison driver code */
  comparisonDriver: string | null;
}

/**
 * Bounds of the track for coordinate scaling
 */
export interface TrackBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}
