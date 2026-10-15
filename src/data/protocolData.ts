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
        id: 'CTF-YZ-SOCIAL-01', slot: '01',
        label: '[ SOCIAL TRACE INVESTIGATION ]', subtitle: 'YELLOW ZONE // SOCIAL GRAPH RECOVERY',
        type: 'CROSS-BUILDING SOCIAL TRACE INVESTIGATION',
        description: 'Inspect the shared local social mirror, compare artifacts across the five buildings, and reconstruct the missing dataset. The shared final recovery signature is submitted from the main Yellow Zone map.',
        clue: '', puzzleType: 'cipher',
        challengePrompt: 'RECONSTRUCT THE MISSING DATASET // SHARED RECOVERY SIGNATURE',
        evidence: [],
        solutionKey: 'CONTINUITY_841_0217_UNIT404', options: undefined, completed: false,
        flagCode: 'FLAG{CONTINUITY_841_0217_UNIT404}',
        unlockedData: 'The shared Yellow Zone investigation terminal reveals the Continuity Ledger only after the common recovery signature is accepted.',
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
        id: 'CTF-YZ-SOCIAL-01', slot: '01',
        label: '[ SOCIAL TRACE INVESTIGATION ]', subtitle: 'YELLOW ZONE // SOCIAL GRAPH RECOVERY',
        type: 'CROSS-BUILDING SOCIAL TRACE INVESTIGATION',
        description: 'Inspect the shared local social mirror, compare artifacts across the five buildings, and reconstruct the missing dataset. The shared final recovery signature is submitted from the main Yellow Zone map.',
        clue: '', puzzleType: 'cipher',
        challengePrompt: 'RECONSTRUCT THE MISSING DATASET // SHARED RECOVERY SIGNATURE',
        evidence: [],
        solutionKey: 'CONTINUITY_841_0217_UNIT404', options: undefined, completed: false,
        flagCode: 'FLAG{CONTINUITY_841_0217_UNIT404}',
        unlockedData: 'The shared Yellow Zone investigation terminal reveals the Continuity Ledger only after the common recovery signature is accepted.',
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
        id: 'CTF-YZ-SOCIAL-01',
        slot: '01',
        label: '[ SOCIAL TRACE INVESTIGATION ]',
        subtitle: 'YELLOW ZONE // SOCIAL GRAPH RECOVERY',
        type: 'CROSS-BUILDING SOCIAL TRACE INVESTIGATION',
        description: 'Inspect the shared local social mirror, compare artifacts across the five buildings, and reconstruct the missing dataset. The shared final recovery signature is submitted from the main Yellow Zone map.',
        clue: '', evidence: [],
        puzzleType: 'cipher',
        challengePrompt: 'RECONSTRUCT THE MISSING DATASET // SHARED RECOVERY SIGNATURE',
        solutionKey: 'CONTINUITY_841_0217_UNIT404',
        options: undefined,
        completed: false,
        flagCode: 'FLAG{CONTINUITY_841_0217_UNIT404}',
        unlockedData: 'The shared Yellow Zone investigation terminal reveals the Continuity Ledger only after the common recovery signature is accepted.',
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
        id: 'CTF-YZ-SOCIAL-01',
        slot: '01',
        label: '[ SOCIAL TRACE INVESTIGATION ]',
        subtitle: 'YELLOW ZONE // SOCIAL GRAPH RECOVERY',
        type: 'CROSS-BUILDING SOCIAL TRACE INVESTIGATION',
        description: 'Inspect the shared local social mirror, compare artifacts across the five buildings, and reconstruct the missing dataset. The shared final recovery signature is submitted from the main Yellow Zone map.',
        clue: '', evidence: [],
        puzzleType: 'relay',
        challengePrompt: 'RECONSTRUCT THE MISSING DATASET // SHARED RECOVERY SIGNATURE',
        solutionKey: 'CONTINUITY_841_0217_UNIT404',
        options: undefined,
        completed: false,
        flagCode: 'FLAG{CONTINUITY_841_0217_UNIT404}',
        unlockedData: 'The shared Yellow Zone investigation terminal reveals the Continuity Ledger only after the common recovery signature is accepted.',
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
        id: 'CTF-YZ-SOCIAL-01',
        slot: '01',
        label: '[ SOCIAL TRACE INVESTIGATION ]',
        subtitle: 'YELLOW ZONE // SOCIAL GRAPH RECOVERY',
        type: 'CROSS-BUILDING SOCIAL TRACE INVESTIGATION',
        description: 'Inspect the shared local social mirror, compare artifacts across the five buildings, and reconstruct the missing dataset. The shared final recovery signature is submitted from the main Yellow Zone map.',
        clue: '', evidence: [],
        puzzleType: 'matrix',
        challengePrompt: 'RECONSTRUCT THE MISSING DATASET // SHARED RECOVERY SIGNATURE',
        solutionKey: 'CONTINUITY_841_0217_UNIT404',
        options: undefined,
        completed: false,
        flagCode: 'FLAG{CONTINUITY_841_0217_UNIT404}',
        unlockedData: 'The shared Yellow Zone investigation terminal reveals the Continuity Ledger only after the common recovery signature is accepted.',
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
