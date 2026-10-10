export type BuildingId = 'hospital' | 'school' | 'museum' | 'sports' | 'society';

export type StatusLevel = 'nominal' | 'warning' | 'critical' | 'standby';

export type PuzzleType = 'cipher' | 'biometric' | 'frequency' | 'matrix' | 'relay';
export type PuzzleMechanic = 'timetable' | 'triage';

export interface CTFData {
  evidence?: { source: string; excerpt: string; image?: string; imageAlt?: string }[];
  id: string;
  slot: '01' | '02';
  label: string; // e.g., "[ MEDICAL TERMINAL ]", "[ RECORD ARCHIVE ]"
  subtitle: string;
  type: string;
  description: string;
  clue: string;
  puzzleType: PuzzleType;
  puzzleMechanic?: PuzzleMechanic;
  challengePrompt: string;
  solutionKey: string;
  options?: string[]; // for quick interactive solve
  completed: boolean;
  flagCode: string;
  unlockedData: string;
  roomPosition: [number, number, number]; // [x, y, z] inside 3D entrance room
  roomRotation?: number; // rotation in radians
}

export interface ResidentRecord {
  sanctuaryId: string;
  fullName: string;
  currentRole: string;
  housingStatus: string;
  dutyStatus: string;
  missedCheckIns: number;
  incidentReports: string[];
  systemNotes: string[];
  recordCompleteness: number; // 0 - 100%
  lastUpdate: string;
  status: 'NOMINAL' | 'FLAGGED FOR PURGE' | 'UNACCOUNTED' | 'EXPUNGED';
  buildingOrigin: BuildingId;
  encryptedFragmentsRecovered: number; // 0 or 1 for the single CTF in each building
}

export interface BuildingData {
  id: BuildingId;
  name: string; // e.g. "HOSPITAL"
  sectorTitle: string; // e.g. "COMMUNITY MEDICAL FACILITY"
  code: string; // e.g. "BLDG-Y01"
  status: string; // e.g. "PARTIALLY ONLINE"
  statusLevel: StatusLevel;
  shortDescription: string;
  loreDescription: string;
  gridPos: {
    x: number; // percentage on map (0 - 100)
    y: number; // percentage on map (0 - 100)
    width: number;
    height: number;
  };
  svgPathData?: string;
  accentColor: string;
  roomTheme: {
    floorColor: number;
    wallColor: number;
    accentGlow: number;
    lightIntensity: number;
    roomType: 'medical' | 'classroom' | 'archive' | 'gym' | 'residential';
    ambientDetails: string[];
  };
  ctfs: CTFData[];
  residentId: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  category: 'SYSTEM' | 'CTF' | 'BIOMETRIC' | 'SECURITY';
  message: string;
  level: 'info' | 'warn' | 'success';
}
