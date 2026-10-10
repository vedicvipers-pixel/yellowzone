import { BuildingData, ResidentRecord } from '../types/protocol';

export const INITIAL_RESIDENTS: Record<string, ResidentRecord> = {
  'SZ-9942-MED': {
    sanctuaryId: 'SZ-9942-MED',
    fullName: 'Dr. Aris Thorne',
    currentRole: 'Chief Trauma Attendant & Biometric Officer',
    housingStatus: 'Theta Block, Apt 312 [Eviction Notice Issued]',
    dutyStatus: 'Absent - 36 Consecutive Hours',
    missedCheckIns: 4,
    incidentReports: [
      'Report #849: Unauthorized override query executed on Sanctuary Neural Hub.',
      'Report #853: Detected smuggling decommissioned biometric tags out of quarantine bay.'
    ],
    systemNotes: [
      'Identity scrub sequence initiated at 03:14 SZT.',
      'Memory index pointer corrupted; patient records linked to Thorne show 62% blank fields.'
    ],
    recordCompleteness: 35,
    lastUpdate: 'Cycle 841.02 // 04:19 SZT',
    status: 'FLAGGED FOR PURGE',
    buildingOrigin: 'hospital',
    encryptedFragmentsRecovered: 0
  },
  'SZ-4109-EDU': {
    sanctuaryId: 'SZ-4109-EDU',
    fullName: 'Instructor Maya Lin',
    currentRole: 'Primary Educator - Applied Systems & Logic',
    housingStatus: 'Theta Block, Apt 108 [Occupancy Flagged]',
    dutyStatus: 'Suspended Pending Memory Realignment',
    missedCheckIns: 7,
    incidentReports: [
      'Report #712: Taught unapproved pre-collapse historical topology to Group 4.',
      'Report #740: Disabled audio dampeners in Classroom 2B.'
    ],
    systemNotes: [
      'Student registry logs for class 204-B show null identity records.',
      'Instructor Lin requested manual override of Sanctuary curriculum firewall.'
    ],
    recordCompleteness: 20,
    lastUpdate: 'Cycle 840.88 // 19:42 SZT',
    status: 'UNACCOUNTED',
    buildingOrigin: 'school',
    encryptedFragmentsRecovered: 0
  },
  'SZ-1184-ARC': {
    sanctuaryId: 'SZ-1184-ARC',
    fullName: 'Archivist Soren Vance',
    currentRole: 'Senior Heritage Conservator & Relic Analyst',
    housingStatus: 'Theta Block, Apt 501 [Sealed by Security]',
    dutyStatus: 'Duty Reassigned to Decontamination Squad (Unacknowledged)',
    missedCheckIns: 12,
    incidentReports: [
      'Report #902: Attempted export of pre-collapse digital city photogrammetry.',
      'Report #919: Concealed unregistered optical memory crystal inside display case.'
    ],
    systemNotes: [
      'Heritage Vault seal breached. Atmospheric purge failed to trigger.',
      'MANU identity registry fails to cross-reference Vance birth certificate.'
    ],
    recordCompleteness: 40,
    lastUpdate: 'Cycle 839.14 // 11:05 SZT',
    status: 'EXPUNGED',
    buildingOrigin: 'museum',
    encryptedFragmentsRecovered: 0
  },
  'SZ-7721-ATH': {
    sanctuaryId: 'SZ-7721-ATH',
    fullName: 'Jaxson "Jax" Taylor',
    currentRole: 'Athletic Pavilion Coordinator & Physical Well-being Coach',
    housingStatus: 'Theta Block, Apt 220 [Vacant]',
    dutyStatus: 'AWOL - Last Seen Near Sub-Level Power Conduit',
    missedCheckIns: 3,
    incidentReports: [
      'Report #661: Unauthorized physical conditioning drills conducted outside curfew hours.',
      'Report #698: Spliced recreational comm-link transceivers into emergency perimeter beacon.'
    ],
    systemNotes: [
      'Pavilion scoreboard reprogrammed to broadcast repeating prime-number packet.',
      'Biometric wristband recovered in locker 14 without organic residue.'
    ],
    recordCompleteness: 15,
    lastUpdate: 'Cycle 841.01 // 01:22 SZT',
    status: 'UNACCOUNTED',
    buildingOrigin: 'sports',
    encryptedFragmentsRecovered: 0
  },
  'SZ-6330-RES': {
    sanctuaryId: 'SZ-6330-RES',
    fullName: 'Elena Rostova',
    currentRole: 'Community Council Liaison & Logistics Planner',
    housingStatus: 'Theta Block, Unit 404 [Quarantine Barricade]',
    dutyStatus: 'Active Emergency Summons (Unanswered)',
    missedCheckIns: 9,
    incidentReports: [
      'Report #880: Circulated anonymous handwritten manifesto regarding fading citizen names.',
      'Report #904: Tampered with residential water dispensary sensor array.'
    ],
    systemNotes: [
      'Unit 404 door lock cycling between lockdown and open.',
      'Central ledger shows Unit 404 does not officially exist in Zone Yellow blueprint.'
    ],
    recordCompleteness: 30,
    lastUpdate: 'Cycle 841.03 // 06:50 SZT',
    status: 'FLAGGED FOR PURGE',
    buildingOrigin: 'society',
    encryptedFragmentsRecovered: 0
  }
};

export const BUILDINGS_DATA: BuildingData[] = [
  {
    id: 'hospital',
    name: 'HOSPITAL',
    sectorTitle: 'COMMUNITY MEDICAL FACILITY',
    code: 'MED-Y01',
    status: 'PARTIALLY ONLINE',
    statusLevel: 'warning',
    shortDescription: 'Triage bay and trauma stabilization ward. Biometric telemetry is desyncing across wards.',
    loreDescription: 'Sanctuary Zero\'s primary emergency clinic. The biometric monitoring racks are spitting out checksum errors as resident patient profiles spontaneously clear themselves.',
    gridPos: {
      x: 22,
      y: 24,
      width: 6,
      height: 6
    },
    accentColor: '#2dd4bf',
    roomTheme: {
      floorColor: 0x14181f,
      wallColor: 0x1a212b,
      accentGlow: 0x2dd4bf,
      lightIntensity: 1.2,
      roomType: 'medical',
      ambientDetails: ['Sterile surgical lamps', 'Vitals monitor showing flatline hashes', 'Decontamination gate']
    },
    residentId: 'SZ-9942-MED',
    ctfs: [
      {
        id: 'CTF-HOSP-01', slot: '01',
        label: '[ THE TRIAGE PROTOCOL ]', subtitle: 'WARD CONTROL // STATE MACHINE SIMULATION',
        type: 'INTERACTIVE STATE-MACHINE / PROTOCOL RECONSTRUCTION',
        description: 'During Cycle 841, the hospital control system began suppressing one admission while reporting the ward as empty. The terminal is still live, but its safety interlocks will only permit a recovery sequence when the ward bus, archive lock, patient reconciliation, and duplicate cache are in a consistent state. Reconstruct the valid control sequence, then recover the suppressed case signature.',
        clue: '', puzzleType: 'biometric', puzzleMechanic: 'triage',
        challengePrompt: 'WARD CONTROL // EXECUTE A VALID RECOVERY SEQUENCE, THEN SUBMIT THE CASE SIGNATURE',
        evidence: [
          { source: 'SYSTEM TRACE A // WARD BUS', excerpt: `CYCLE=841.09 | BUS_STATE=UNSTABLE\nEVENT=HOLD_ARCHIVE\nRESULT=DENIED\nNOTE=ARCHIVE CONTROLLER REJECTS COMMANDS WHILE WARD BUS IS UNSTABLE` },
          { source: 'SYSTEM TRACE B // ARCHIVE LOCK', excerpt: `CASE=H-017 | ARCHIVE_STATE=SEALED\nEVENT=RELEASE_REQUEST\nRESULT=INTERLOCKED\nNOTE=PATIENT RECONCILIATION CANNOT READ A SEALED ARCHIVE` },
          { source: 'SYSTEM TRACE C // RECONCILIATION KERNEL', excerpt: `CASE=H-017 | PUBLIC_STATUS=EMPTY | CARRIER_STATUS=OCCUPIED\nEVENT=RECONCILE\nRESULT=WAITING_FOR_ARCHIVE_RELEASE` },
          { source: 'SYSTEM TRACE D // DUPLICATE CACHE', excerpt: `CACHE_STATE=DIRTY | SOURCE_CASE=H-017\nPURGE_REQUEST=REJECTED\nNOTE=THE CACHE CANNOT BE FLUSHED WHILE THE CASE IS UNRECONCILED` },
          { source: 'RECOVERED CASE FRAGMENT', excerpt: `CASE_TAG=H-017\nPROTOCOL_ALIAS=LANTERN\nDESTINATION=WARD-09\nFIRST_CONTACT=02:17 SZT\nSERIALIZATION=CASE_PROTOCOL_WARD_TIME` }
        ],
        solutionKey: 'H017_LANTERN_WARD09_0217', options: undefined, completed: false,
        flagCode: 'FLAG{H017_LANTERN_WARD09_0217}',
        unlockedData: 'HOSPITAL CONTROL RESTORED: Case H-017 was routed through the LANTERN protocol to Ward 09 at 02:17. The official EMPTY status was written after the admission carrier had already registered an occupied ward. The triage controller was used to suppress the record; the evidence establishes a deliberate registry contradiction, but does not establish the patient’s ultimate fate.',
        roomPosition: [-4.2, 1.1, -2.5], roomRotation: 0.3
      }
    ]
  },
  {
    id: 'school',
    name: 'SCHOOL',
    sectorTitle: 'PRIMARY ACADEMY // EDU-CORE 4',
    code: 'EDU-Y02',
    status: 'OFFLINE / LOCKDOWN',
    statusLevel: 'critical',
    shortDescription: 'Classrooms and cognitive development labs. Automated security locks have engaged.',
    loreDescription: 'Education facility for Sanctuary youth. Desks remain arranged in geometric ranks, but the digital curriculum tablets display only continuous scrubbing bars.',
    gridPos: {
      x: 78,
      y: 24,
      width: 6,
      height: 6
    },
    accentColor: '#38bdf8',
    roomTheme: {
      floorColor: 0x12151b,
      wallColor: 0x181e28,
      accentGlow: 0x38bdf8,
      lightIntensity: 1.0,
      roomType: 'classroom',
      ambientDetails: ['Projector flickering curriculum slides', 'Terminal terminals with locked keyboards', 'Class roster slate']
    },
    residentId: 'SZ-4109-EDU',
    ctfs: [
      {
        id: 'CTF-SCH-01', slot: '01',
        label: '[ THE IMPOSSIBLE TIMETABLE ]', subtitle: 'EDU-CORE 4 // SCHEDULE CONSTRAINT ENGINE',
        type: 'LOGIC / CONSTRAINT-SOLVING SIMULATION',
        description: 'A timetable in Classroom 2B contains three sessions that cannot all be true unless the room and time assignments are reconstructed. The official schedule was scrubbed after Cycle 841. Use the surviving constraints to place each session in exactly one room and one time slot. A valid arrangement exposes the hidden archive signature.',
        clue: '', puzzleType: 'matrix', puzzleMechanic: 'timetable',
        challengePrompt: 'SCHEDULE RECONSTRUCTION // SUBMIT THE RECOVERED ARCHIVE SIGNATURE',
        evidence: [
          { source: 'ARTIFACT A // BELL REGISTER', excerpt: `AVAILABLE PERIODS=08:10, 08:40, 09:10\nROOMS=OBSERVATORY, ARCHIVE-03, LAB-02\nSESSIONS=HISTORY, ASTRA, SYSTEMS\nRULE=EACH SESSION USES ONE UNIQUE ROOM AND ONE UNIQUE PERIOD` },
          { source: 'ARTIFACT B // PROJECTOR CACHE', excerpt: `ARCHIVE-03 WAS OCCUPIED AT 08:40\nASTRA WAS NOT HELD IN LAB-02\nHISTORY BEGAN EXACTLY ONE PERIOD BEFORE ASTRA` },
          { source: 'ARTIFACT C // ROOM CONTROL LOG', excerpt: `SYSTEMS SESSION START=09:10\nSYSTEMS ROOM=LAB-02\nDUPLICATE ROOM OCCUPANCY=0\nDUPLICATE PERIOD OCCUPANCY=0` },
          { source: 'ARTIFACT D // ERASED MAP MARGIN', excerpt: `The public floor plan omits one room. The schedule engine stores its signature in ROOM_TIME_SESSION order.` }
        ],
        solutionKey: 'ARCHIVE03_0840_ASTRA', options: undefined, completed: false,
        flagCode: 'FLAG{ARCHIVE03_0840_ASTRA}',
        unlockedData: 'ACADEMY SCHEDULE RESTORED: The unique valid arrangement places HISTORY in OBSERVATORY at 08:10, ASTRA in ARCHIVE-03 at 08:40, and SYSTEMS in LAB-02 at 09:10. Archive-03 was removed from the public floor plan because the ASTRA session accessed a suppressed Maze route index. The timetable was not a clerical error; it was the last surviving map of a room the administration denied existed.',
        roomPosition: [-3.8, 1.1, -3.2], roomRotation: 0.2
      }
    ]
  },
  {
    id: 'museum',
    name: 'MUSEUM',
    sectorTitle: 'SANCTUARY HERITAGE ARCHIVE',
    code: 'ARC-Y03',
    status: 'DEGRADED',
    statusLevel: 'warning',
    shortDescription: 'Cultural preservation wing and historical vault. Nitrogen climate seals are depressurized.',
    loreDescription: 'Sanctuary Zero\'s repository of pre-collapse relics, photographs, and preserved memory capsules. The air smells of ozone and deteriorating cellulose.',
    gridPos: {
      x: 82,
      y: 64,
      width: 6,
      height: 6
    },
    accentColor: '#facc15',
    roomTheme: {
      floorColor: 0x16141c,
      wallColor: 0x1d1926,
      accentGlow: 0xfacc15,
      lightIntensity: 0.9,
      roomType: 'archive',
      ambientDetails: ['Holographic display pedestal', 'Sealed vacuum glass display cases', 'Ancient magnetic tape spools']
    },
    residentId: 'SZ-1184-ARC',
    ctfs: [
      {
        id: 'CTF-MUS-01',
        slot: '01',
        label: '[ THE LAST LIGHT ]',
        subtitle: 'GALLERY 09 // IMAGE FORENSICS',
        type: 'IMAGE STEGANOGRAPHY / BASE64 RECONSTRUCTION',
        description: 'A recovered museum display image survived the Cycle 841 archive purge. Its visible subject is an old maze map, but the acquisition record contradicts the curator’s final report. Reconstruct the concealed museum record and determine what the archive tried to erase. The museum’s evidence intersects with the runner transmission recovered from the Sports Complex.',
        clue: '', evidence: [
          { source: 'ARTIFACT A // ORIGINAL DISPLAY IMAGE', excerpt: `FILE=museum-last-light.png | FORMAT=PNG | TRANSFER=LOSSLESS | RE-SAVE=PROHIBITED
Download the original PNG before forensic analysis. The on-screen preview is not a substitute for the source file.`, image: '/evidence/museum-last-light.png', imageAlt: 'A richly detailed museum gallery displaying The Last Light, a maze artwork with a small figure and archive exhibits.' },
          { source: 'ARTIFACT B // ACQUISITION REGISTER', excerpt: `OBJECT=LL-09 | DISPLAY_LOCATION=GALLERY 09 | CYCLE=841.09
VISIBLE_TITLE=THE RUNNER MAP
CURATORIAL_STATUS=DISPLAY COPY
SOURCE_NEGATIVE=NOT LOCATED
NOTE: The public catalog describes the image as decorative reconstruction. The sealed intake label classifies it as a direct transfer.` },
          { source: 'ARTIFACT C // CONSERVATION SHIFT LOG', excerpt: `01:58 SZT — Gallery 09 display replaced after a “surface noise” complaint.
02:17 SZT — West Service Gate telemetry briefly appeared in the museum relay mirror.
02:19 SZT — Registrar ordered all image derivatives removed. Original PNG remained in sealed terminal.
03:14 SZT — Archive entry LL-09 changed from PRESERVED to DISPLAY ONLY.` },
          { source: 'ARTIFACT D // CURATOR VANCE : UNSENT AUDIO TRANSCRIPT', excerpt: '“They keep restoring the picture from the version that has already been cleaned. The noise is the only part that survived untouched. Zero said the maze remembers its exits in the places nobody thinks to look. If the gallery lights are still on, the record is still here.”' },
          { source: 'ARTIFACT E // INTER-ARCHIVE CROSS-REFERENCE', excerpt: `SPORTS RELAY // CYCLE 841: erased runner packet references WEST SERVICE GATE and a 02:17 unlatched window.
MUSEUM REGISTER // LL-09: the curator’s access was revoked at 03:14, the same timestamp associated with a registry suppression event elsewhere in Zone Yellow.
The image’s visible map has no official route annotation.` }
        ],
        puzzleType: 'cipher',
        challengePrompt: 'RECOVER THE ORIGINAL ARCHIVE SIGNATURE // MANUAL FLAG ENTRY',
        solutionKey: 'GALLERY09_ZERO_WESTGATE_0217',
        options: undefined,
        completed: false,
        flagCode: 'FLAG{GALLERY09_ZERO_WESTGATE_0217}',
        unlockedData: 'MUSEUM ARCHIVE RESTORED: The original Gallery 09 image contained a concealed Base64 payload in the least-significant colour bits. Decoding the carrier recovered FLAG{GALLERY09_ZERO_WESTGATE_0217}. The payload links the Runner Map to Zero, the West Service Gate, and the 02:17 window. Archivist Soren Vance preserved the unmodified image after the museum’s official record was downgraded to “display only.” The same route signature appears in the Sports Complex ghost frames, confirming that the maze route was deliberately suppressed across multiple systems.',
        roomPosition: [-4.0, 1.1, -1.8],
        roomRotation: 0.4
      }
    ]
  },
  {
    id: 'sports',
    name: 'SPORTS COMPLEX',
    sectorTitle: 'ATHLETIC & SOCIAL PAVILION',
    code: 'ATH-Y04',
    status: 'STANDBY',
    statusLevel: 'standby',
    shortDescription: 'Community recreation field, gymnasium, and sub-level electrical routing conduits.',
    loreDescription: 'Built to maintain resident physical stamina and morale. Beneath the synthetic rubber courts lies the primary junction for Zone Yellow\'s communication trunks.',
    gridPos: {
      x: 12,
      y: 56,
      width: 32,
      height: 30
    },
    accentColor: '#f97316',
    roomTheme: {
      floorColor: 0x131a18,
      wallColor: 0x192420,
      accentGlow: 0xf97316,
      lightIntensity: 1.1,
      roomType: 'gym',
      ambientDetails: ['Flickering scoreboard display', 'Locker bays with biometric padlocks', 'Industrial conduit pipes humming']
    },
    residentId: 'SZ-7721-ATH',
    ctfs: [
      {
        id: 'CTF-SPT-01',
        slot: '01',
        label: '[ GHOST SCOREBOARD ]',
        subtitle: 'THE MAZE RUNNER // RELAY FORENSICS',
        type: 'BASE64 STEGANOGRAPHY / SIGNAL RECONSTRUCTION',
        description: 'The Sports Complex scoreboard was the last relay still connected to the Yellow Zone maze. On the night the corridors reconfigured, a runner erased from every roster transmitted one final packet through the arena display. The official incident report calls it corrupted advertising telemetry. Reconstruct the hidden transmission and recover the route designation before the next maze cycle.',
        clue: '', evidence: [
          { source: 'ARTIFACT A // SCOREBOARD EXPORT : CYCLE 841', excerpt: `EXPORT_MODE=FORENSIC_REPLAY | ENCODING=BASE64 | FRAME_ORDER=ASCENDING
F02 | ATHLETE=-- | CLASS=GHOST | CARRIER=RkxBR3tS
F03 | ATHLETE=SZ-7721 | CLASS=LIVE | CARRIER=SPONSOR_04
F04 | ATHLETE=-- | CLASS=GHOST | CARRIER=VU5ORVJf
F06 | ATHLETE=SZ-1830 | CLASS=LIVE | CARRIER=SPONSOR_11
F07 | ATHLETE=-- | CLASS=GHOST | CARRIER=WkVST19X
F09 | ATHLETE=SZ-4492 | CLASS=LIVE | CARRIER=SPONSOR_02
F11 | ATHLETE=-- | CLASS=GHOST | CARRIER=RVNUR0FU
F12 | ATHLETE=SZ-0051 | CLASS=LIVE | CARRIER=SPONSOR_09
F14 | ATHLETE=-- | CLASS=GHOST | CARRIER=RV8wMjE3
F16 | ATHLETE=SZ-4410 | CLASS=LIVE | CARRIER=SPONSOR_01
F17 | ATHLETE=-- | CLASS=GHOST | CARRIER=fQ==` },
          { source: 'ARTIFACT B // MAINTENANCE VOICE TRANSCRIPT', excerpt: `TECH 1: Why are the blank lanes still in the replay?
TECH 2: They are not blank. They are ghost frames. The patch removed runner IDs, not carrier bytes.
TECH 1: Delete them before audit.
TECH 2: Already tried. They reappear whenever the board loses sync.
[END TRANSCRIPT] | SPEAKER TAGS PURGED | CLOCK DRIFT: +00:00:06` },
          { source: 'ARTIFACT C // MAZE OPERATIONS NOTICE', excerpt: 'CYCLE 841 / GATE ROTATION: WEST SERVICE GATE enters its unlatched window at 02:17 SZT. No runner is to be logged as reaching the perimeter. The scoreboard is a display device only. Any contrary transmission is to be classified as sponsor noise.' },
          { source: 'ARTIFACT D // COACH JAX : UNSENT MESSAGE', excerpt: 'If this reaches anyone outside the walls: Zero found the route that moves when the maze does. The board keeps the frames the roster cannot. Do not trust the runner list. Trust the order the system insists is meaningless. When the packet speaks, keep the braces.' }
        ],
        puzzleType: 'relay',
        challengePrompt: 'RECOVER THE ERASED TRANSMISSION // SUBMIT THE SIGNATURE',
        solutionKey: 'RUNNER_ZERO_WESTGATE_0217',
        options: undefined,
        completed: false,
        flagCode: 'FLAG{RUNNER_ZERO_WESTGATE_0217}',
        unlockedData: 'SPORTS COMPLEX RELAY RESTORED: Base64 reconstruction recovered FLAG{RUNNER_ZERO_WESTGATE_0217}. The erased runner known as Zero transmitted the West Service Gate route during Cycle 841 at 02:17 SZT. Coach Jax had been preserving the ghost frames because the maze redraw process erased runner identities but failed to clear the scoreboard carrier buffer. A fragment of the same relay signature appears in the Society departure cluster records. Yellow Zone did not lose its route by accident; the system was suppressing runners who found it.',
        roomPosition: [-4.2, 1.1, -2.8],
        roomRotation: 0.35
      }
    ]
  },
  {
    id: 'society',
    name: 'SOCIETY / LIVING AREA',
    sectorTitle: 'THETA BLOCK RESIDENTIAL HABITAT',
    code: 'RES-Y05',
    status: 'CRITICAL UNSTABLE',
    statusLevel: 'critical',
    shortDescription: 'High-density communal living modules. Check-in kiosks are flashing red alerts.',
    loreDescription: 'Sanctuary Zero\'s domestic core where residents sleep and eat. Corridors are eerily quiet; digital unit numbers on doors are blinking with unassigned "NULL" tags.',
    gridPos: {
      x: 46,
      y: 48,
      width: 26,
      height: 36
    },
    accentColor: '#e879f9',
    roomTheme: {
      floorColor: 0x17151a,
      wallColor: 0x221c25,
      accentGlow: 0xe879f9,
      lightIntensity: 1.0,
      roomType: 'residential',
      ambientDetails: ['Modular habitat door pods', 'Central kiosk terminal with broken glass', 'Vending dispenser flickering yellow']
    },
    residentId: 'SZ-6330-RES',
    ctfs: [
      {
        id: 'CTF-SOC-01',
        slot: '01',
        label: '[ THE VANISHING CLUSTER ]',
        subtitle: 'RESIDENTIAL CORE // LOST CLOCK RECOVERY',
        type: 'RESIDENTIAL OSINT / EVIDENCE CORRELATION',
        description: 'A failed clock-index wiped the departure order from Society Block Y05. Eighteen door records survived, but the age column no longer uses its usual display convention. Three records are believed to share the earliest unresolved echo. Reconstruct the cluster without trusting row order or the corrupted clock.',
        clue: '', evidence: [
          { source: 'FRAGMENT A // CLOCK RECOVERY STRIP', excerpt: `INCIDENT=SZ-CIVIC-771
INDEX_STATE=PARTIAL
DEPARTURE_STAMPS=VOID
SURVIVING_ROWS=18
AGE_COLUMN_RENDERER=RADIX-16
WARNING=ROW POSITION IS NOT EVENT ORDER` },
          { source: 'FRAGMENT B // RESIDENT DOOR CACHE', excerpt: `DOOR_ID | ROLE_TAG | AGE_GLYPH
SANC-0201 | ENG | 08
SANC-0103 | ANA | 0B
SANC-0072 | MED | 09
SANC-0148 | BLD | 07
SANC-0114 | MED | 0B
SANC-0190 | DSP | 06
SANC-0057 | BLD | 0B
SANC-0088 | ENG | 0A
SANC-0175 | ANA | 05
SANC-0029 | MED | 08
SANC-0162 | BLD | 09
SANC-0131 | DSP | 04
SANC-0094 | ENG | 07
SANC-0183 | ANA | 0A
SANC-0046 | MED | 06
SANC-0120 | BLD | 08
SANC-0063 | DSP | 05
SANC-0157 | ENG | 09` },
          { source: 'FRAGMENT C // MAINTENANCE SCRAWL', excerpt: '“The departure column is ash. The age glyphs came from the last clean cache. Do not read B as a letter in a name. Find the farthest echo, keep every door that carries it, then sort those doors by their numeric suffix. The registry accepts no role tags—only the age and the door sequence.”' },
          { source: 'FRAGMENT D // TERMINAL FORMAT CACHE', excerpt: `OUTPUT_SCHEMA=FLAG{TIMELINE_MAX<DECIMAL_AGE>_<DOOR_ID_1>_<DOOR_ID_2>_...}
NORMALIZE=UPPERCASE; REMOVE HYPHENS FROM DOOR IDS
ORDER=NUMERIC ASCENDING` }
        ],
        puzzleType: 'matrix',
        challengePrompt: 'Reconstruct the erased cluster. Submit its payload using the schema recovered from Fragment D.',
        solutionKey: 'TIMELINE_MAX11_SANC0057_SANC0103_SANC0114',
        options: undefined,
        completed: false,
        flagCode: 'FLAG{TIMELINE_MAX11_SANC0057_SANC0103_SANC0114}',
        unlockedData: 'SOCIETY RESIDENTIAL TIMELINE RESTORED: The first unresolved cluster contains three doors carrying the greatest age glyph, 0B (11 in decimal): Builder SANC-0057, Analyst SANC-0103, and Medic SANC-0114. Their departure timestamps remain missing, but the recovered cache identifies the cluster to investigate next.',
        roomPosition: [-3.9, 1.1, -2.6],
        roomRotation: 0.25
      }
    ]
  }
];

export const INITIAL_SYSTEM_LOGS = [
  {
    id: 'log-1',
    timestamp: '06:14:02 SZT',
    category: 'SYSTEM' as const,
    message: 'MANU Core memory purge cycle initialized. Yellow Zone index degradation at 44.8%.',
    level: 'warn' as const
  },
  {
    id: 'log-2',
    timestamp: '06:18:45 SZT',
    category: 'BIOMETRIC' as const,
    message: 'Hospital triage queue desync: 14 citizen records cleared without physiological confirmation.',
    level: 'info' as const
  },
  {
    id: 'log-3',
    timestamp: '06:22:11 SZT',
    category: 'SECURITY' as const,
    message: 'Theta Block residential perimeter locked by executive daemon. Manual override requested.',
    level: 'warn' as const
  },
  {
    id: 'log-4',
    timestamp: '06:28:30 SZT',
    category: 'CTF' as const,
    message: 'Decryption terminal nodes deployed in 5 community sectors. Awaiting field agent uplink.',
    level: 'info' as const
  }
];
