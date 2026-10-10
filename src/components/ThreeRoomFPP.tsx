import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BuildingData, BuildingId, CTFData } from '../types/protocol';
import { sound } from '../utils/sound';
import { CheckCircle2, Database, FileSearch, Lock, Zap } from 'lucide-react';

interface ThreeRoomFPPProps {
  building: BuildingData;
  onInteractCTF: (ctf: CTFData) => void;
  onOpenDataset?: () => void;
  onReturnToMap: () => void;
}

type Prompt = { type: 'ctf' | 'dataset' | 'exit'; target?: CTFData; message: string } | null;

const THEMES: Record<string, { bg: number; wall: number; floor: number; primary: number; accent: number; label: string; detail: string }> = {
  hospital: { bg: 0x07151a, wall: 0x12313a, floor: 0x0d252c, primary: 0x2dd4bf, accent: 0xef4444, label: 'MEDICAL TRIAGE', detail: 'VITALS // PATIENT MONITORING' },
  school: { bg: 0x081522, wall: 0x172f45, floor: 0x101f2e, primary: 0x38bdf8, accent: 0xfbbf24, label: 'LEARNING HUB', detail: 'ATTENDANCE // ACADEMIC RECORDS' },
  museum: { bg: 0x10091b, wall: 0x26173b, floor: 0x140d24, primary: 0xfacc15, accent: 0xc084fc, label: 'ARCHIVE GALLERY', detail: 'ARTIFACTS // HISTORICAL RECORDS' },
  sports: { bg: 0x160d07, wall: 0x302014, floor: 0x20130a, primary: 0xfb923c, accent: 0xfacc15, label: 'ATHLETICS CONTROL', detail: 'LIVE ARENA // PERFORMANCE DATA' },
  society: { bg: 0x150b1b, wall: 0x2b1734, floor: 0x1b1022, primary: 0xe879f9, accent: 0xfacc15, label: 'RESIDENT SERVICES', detail: 'OCCUPANCY // COMMUNITY RECORDS' },
};

const ROOM_PANEL_COPY: Record<BuildingId, { leftTitle: string; rightTitle: string; leftStatus: string; rightStatus: string; footer: string }> = {
  hospital: { leftTitle: 'MEDICAL // TRIAGE', rightTitle: 'WARD STATE // H-017', leftStatus: 'WARD BUS // UNSTABLE', rightStatus: 'CASE H-017 // SEALED', footer: 'PATIENT RECONCILIATION // LOCAL CLINICAL FEED' },
  school: { leftTitle: 'ACADEMY // SCHEDULE', rightTitle: 'EDU-CORE // AUDIT', leftStatus: 'SCHEDULE CACHE // CONFLICT', rightStatus: 'CLASS REGISTER // DEGRADED', footer: 'ACADEMIC SYSTEMS // LOCAL ARCHIVE FEED' },
  museum: { leftTitle: 'ARCHIVE // GALLERY 09', rightTitle: 'CONSERVATION // LL-09', leftStatus: 'ORIGINAL IMAGE // PRESERVED', rightStatus: 'ACQUISITION LOG // SEALED', footer: 'HERITAGE CONSERVATION // LOCAL ARCHIVE FEED' },
  sports: { leftTitle: 'ARENA // RELAY CONTROL', rightTitle: 'GHOST FRAMES // Y-04', leftStatus: 'UNREGISTERED PACKETS', rightStatus: 'SCOREBOARD BUFFER // LIVE', footer: 'ATHLETIC RELAY // LOCAL TELEMETRY FEED' },
  society: { leftTitle: 'RESIDENTIAL // THETA', rightTitle: 'DOOR CACHE // Y-05', leftStatus: 'OCCUPANCY INDEX // DEGRADED', rightStatus: 'RESIDENT LEDGER // SEALED', footer: 'RESIDENT SERVICES // LOCAL REGISTRY FEED' },
};

export const ThreeRoomFPP: React.FC<ThreeRoomFPPProps> = ({ building, onInteractCTF, onOpenDataset, onReturnToMap }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const roomIdRef = useRef<BuildingId | null>(null);
  const callbacksRef = useRef({ onInteractCTF, onOpenDataset, onReturnToMap });
  callbacksRef.current = { onInteractCTF, onOpenDataset, onReturnToMap };
  const stateRef = useRef({
    keys: { forward: false, backward: false, left: false, right: false, sprint: false },
    yaw: 0,
    pitch: 0,
    mouseDown: false,
    lastX: 0,
    lastY: 0,
    pos: new THREE.Vector3(0, 1.65, 2.35),
    prompt: null as Prompt,
  });
  const [activePrompt, setActivePrompt] = useState<Prompt>(null);
  const [sprinting, setSprinting] = useState(false);
  const visibleCTF = building.ctfs.slice(0, 1)[0];
  const theme = THEMES[building.id] ?? THEMES.hospital;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const state = stateRef.current;
    // Only reset the view when entering a different building. If a CTF solve refreshes
    // the scene to swap the terminal texture, preserve the player's position and heading.
    if (roomIdRef.current !== building.id) {
      state.pos.set(0, 1.65, 2.35);
      state.yaw = 0;
      state.pitch = 0;
      roomIdRef.current = building.id;
    }
    state.prompt = null;
    setActivePrompt(null);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme.bg);
    scene.fog = new THREE.FogExp2(theme.bg, 0.025);
    const camera = new THREE.PerspectiveCamera(72, container.clientWidth / container.clientHeight, 0.1, 70);
    camera.position.copy(state.pos);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    // Cap render resolution to avoid 4K/high-DPI devices multiplying GPU work.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
    renderer.setSize(container.clientWidth, container.clientHeight);
    // The room has many emissive details and point lights; real-time soft shadows
    // were the most expensive pass and are not essential to navigation.
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    const roomW = 10;
    const roomL = 10;
    const roomH = 3.8;
    const materials: THREE.Material[] = [];
    const textures: THREE.Texture[] = [];
    const interactive: { type: 'ctf' | 'dataset' | 'exit'; pos: THREE.Vector3; ctf?: CTFData }[] = [];
    const blockers: { minX: number; maxX: number; minZ: number; maxZ: number }[] = [];
    const addBlocker = (minX: number, maxX: number, minZ: number, maxZ: number) => {
      blockers.push({ minX, maxX, minZ, maxZ });
    };
    const addMaterial = <T extends THREE.Material,>(m: T): T => { materials.push(m); return m; };
    const box = (w: number, h: number, d: number, color: number, x: number, y: number, z: number, opts: { metalness?: number; roughness?: number; emissive?: number; emissiveIntensity?: number } = {}) => {
      const mat = addMaterial(new THREE.MeshStandardMaterial({ color, metalness: opts.metalness ?? 0.45, roughness: opts.roughness ?? 0.48, emissive: opts.emissive ?? 0x000000, emissiveIntensity: opts.emissiveIntensity ?? 0 }));
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      mesh.position.set(x, y, z); mesh.castShadow = false; mesh.receiveShadow = false; scene.add(mesh); return mesh;
    };
    const pointLight = (color: number, intensity: number, distance: number, x: number, y: number, z: number) => {
      const l = new THREE.PointLight(color, intensity, distance, 1.8); l.position.set(x, y, z); scene.add(l); return l;
    };
    const makeScreenTexture = (kind: 'ctf' | 'dataset' | 'scoreboard') => {
      const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 360;
      const ctx = canvas.getContext('2d')!;
      const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; textures.push(tex);
      const draw = (time = 0) => {
        ctx.fillStyle = '#071019'; ctx.fillRect(0, 0, 640, 360);
        ctx.fillStyle = `#${theme.primary.toString(16).padStart(6, '0')}`; ctx.fillRect(0, 0, 640, 8);
        ctx.strokeStyle = `#${theme.primary.toString(16).padStart(6, '0')}`; ctx.lineWidth = 2; ctx.strokeRect(14, 14, 612, 332);
        ctx.fillStyle = '#e5edf5'; ctx.font = 'bold 29px monospace';
        ctx.fillText(kind === 'ctf' ? 'MANU // CHALLENGE NODE' : kind === 'dataset' ? 'MANU // EVIDENCE ARCHIVE' : 'YELLOW ZONE // ARENA FEED', 30, 56);
        ctx.fillStyle = `#${theme.accent.toString(16).padStart(6, '0')}`; ctx.font = 'bold 20px monospace';
        if (kind === 'ctf') {
          ctx.fillText(visibleCTF?.label.replace(/[\[\]]/g, '') ?? 'CTF TERMINAL', 30, 112);
          ctx.fillStyle = visibleCTF?.completed ? '#34d399' : '#fbbf24'; ctx.font = 'bold 24px monospace';
          ctx.fillText(visibleCTF?.completed ? 'STATUS: SECURED' : 'STATUS: READY FOR ACCESS', 30, 162);
          ctx.fillStyle = '#91a5b8'; ctx.font = '17px monospace'; ctx.fillText('INTERACT TO OPEN THE ACTIVE CHALLENGE', 30, 214);
          ctx.fillText(`NODE ${building.code} // ${visibleCTF?.slot ?? '01'}`, 30, 252);
        } else if (kind === 'dataset') {
          ctx.fillText(`${building.name} // DATASET`, 30, 112);
          ctx.fillStyle = visibleCTF?.completed ? '#34d399' : '#fbbf24'; ctx.font = 'bold 24px monospace';
          ctx.fillText(visibleCTF?.completed ? 'ACCESS: UNLOCKED' : 'ACCESS: LOCKED', 30, 160);
          ctx.fillStyle = '#91a5b8'; ctx.font = '18px monospace';
          if (visibleCTF?.completed) {
            ctx.fillText('RECORDS: AVAILABLE', 30, 202);
            ctx.fillText('SOURCE: LOCAL SANCTUARY ARCHIVE', 30, 238);
            ctx.fillText('INTERACT TO INSPECT EVIDENCE', 30, 278);
            ctx.fillStyle = '#34d399'; ctx.fillRect(30, 310, 400 + Math.sin(time * 2) * 20, 5);
          } else {
            ctx.fillText('ENCRYPTED RECORDS DETECTED', 30, 210);
            ctx.fillText('REQUIREMENT: SOLVE THIS ROOM CTF', 30, 250);
            ctx.fillStyle = '#fbbf24'; ctx.fillRect(30, 290, 390, 5);
            ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 17px monospace'; ctx.fillText('DATA SEALED // NO ACCESS', 30, 322);
          }
        } else {
          ctx.fillText('ARENA SYSTEMS ONLINE', 30, 112);
          ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 46px monospace'; ctx.fillText('Y-04', 30, 190);
          ctx.fillStyle = '#91a5b8'; ctx.font = '18px monospace'; ctx.fillText('TRAINING ARENA // PERFORMANCE FEED', 30, 242);
          ctx.fillStyle = '#34d399'; ctx.fillText('SYSTEM NOMINAL', 30, 294);
        }
        tex.needsUpdate = true;
      };
      draw(); return { tex, draw };
    };

    // Compact architectural shell. The south door (+Z) stays behind the player on entry.
    scene.add(new THREE.HemisphereLight(0xb9d9ee, theme.floor, 1.55));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.35); keyLight.position.set(-3, 7, 4); keyLight.castShadow = false; scene.add(keyLight);
    // Keep the two principal lights; emissive fixtures supply local color without
    // multiplying per-pixel point-light cost on lower-end laptops.
    pointLight(theme.primary, 12, 13, -2.7, 3.0, -2.5);
    pointLight(theme.accent, 6, 9, 3.0, 2.5, 0.8);
    const floorMat = addMaterial(new THREE.MeshStandardMaterial({ color: theme.floor, metalness: 0.55, roughness: 0.4 }));
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomL), floorMat); floor.rotation.x = -Math.PI / 2; scene.add(floor);
    const wallMat = addMaterial(new THREE.MeshStandardMaterial({ color: theme.wall, metalness: 0.35, roughness: 0.62 }));
    const addWall = (w: number, h: number, d: number, x: number, y: number, z: number) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat); m.position.set(x,y,z); scene.add(m); };
    addWall(roomW, roomH, 0.22, 0, roomH / 2, -roomL / 2);
    addWall(0.22, roomH, roomL, -roomW / 2, roomH / 2, 0);
    addWall(0.22, roomH, roomL, roomW / 2, roomH / 2, 0);
    addWall(roomW, roomH, 0.22, 0, roomH / 2, roomL / 2);
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomL), addMaterial(new THREE.MeshStandardMaterial({ color: 0x111923, metalness: 0.35, roughness: 0.8 })));
    ceiling.rotation.x = Math.PI / 2; ceiling.position.y = roomH; scene.add(ceiling);

    // Glowing edge strips make the compact space readable rather than dark and empty.
    box(roomW - 0.5, 0.045, 0.08, theme.primary, 0, 3.45, -4.78, { emissive: theme.primary, emissiveIntensity: 0.9 });
    box(0.08, 0.045, roomL - 0.5, theme.primary, -4.78, 3.45, 0, { emissive: theme.primary, emissiveIntensity: 0.9 });
    box(0.08, 0.045, roomL - 0.5, theme.primary, 4.78, 3.45, 0, { emissive: theme.primary, emissiveIntensity: 0.9 });
    box(2.3, 2.7, 0.32, 0x101722, 0, 1.35, 4.78, { metalness: 0.8 });
    box(1.9, 0.12, 0.36, theme.accent, 0, 2.55, 4.55, { emissive: theme.accent, emissiveIntensity: 0.7 });
    // Refined entrance details: illuminated jambs, status indicators and a tactile threshold strip.
    for (const x of [-1.18, 1.18]) {
      box(0.075, 2.55, 0.11, theme.primary, x, 1.35, 4.53, { emissive: theme.primary, emissiveIntensity: 0.95 });
      box(0.16, 0.12, 0.12, theme.accent, x, 2.68, 4.51, { emissive: theme.accent, emissiveIntensity: 0.8 });
    }
    for (let i = 0; i < 7; i++) box(0.62, 0.018, 0.07, i % 2 === 0 ? theme.accent : 0x263746, -1.86 + i * 0.62, 0.025, 3.82, { emissive: i % 2 === 0 ? theme.accent : 0x000000, emissiveIntensity: 0.35 });

    // Architectural dressing: brighter ceiling luminaires, structural ribs, floor inlays and side-wall information panels.
    // These make the room read as a designed facility rather than an empty dark box.
    for (const z of [-3.5, 3.45]) {
      box(8.65, 0.09, 0.12, 0x080d14, 0, 3.48, z, { metalness: 0.8 });
      box(7.9, 0.035, 0.045, theme.primary, 0, 3.43, z, { emissive: theme.primary, emissiveIntensity: 1.35 });
    }
    for (const x of [-4.48, 4.48]) {
      for (const z of [-3.65, 3.65]) {
        box(0.18, 3.1, 0.18, 0x0a111b, x, 1.55, z, { metalness: 0.82, roughness: 0.28 });
        box(0.035, 2.75, 0.045, theme.accent, x + (x < 0 ? 0.105 : -0.105), 1.55, z, { emissive: theme.accent, emissiveIntensity: 0.9 });
      }
    }
    // Three luminous ceiling panels provide broad, readable fill light.
    for (const z of [-2.7, 2.7]) {
      box(2.6, 0.055, 0.78, 0x172635, 0, 3.66, z, { metalness: 0.25, roughness: 0.35, emissive: theme.primary, emissiveIntensity: 0.22 });
      box(2.25, 0.025, 0.48, 0xc8f7ff, 0, 3.62, z, { emissive: theme.primary, emissiveIntensity: 1.4 });
    }
    // Inlaid guide lines frame the walking lane without filling the small room with clutter.
    box(0.035, 0.018, 7.1, theme.primary, -3.9, 0.018, -0.1, { emissive: theme.primary, emissiveIntensity: 0.55 });
    box(0.035, 0.018, 7.1, theme.primary, 3.9, 0.018, -0.1, { emissive: theme.primary, emissiveIntensity: 0.55 });
    box(6.9, 0.018, 0.035, theme.accent, 0, 0.02, 3.65, { emissive: theme.accent, emissiveIntensity: 0.45 });
    box(6.9, 0.018, 0.035, theme.accent, 0, 0.02, -3.65, { emissive: theme.accent, emissiveIntensity: 0.45 });

    const makeWallGraphic = (side: 'left' | 'right') => {
      const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 320;
      const g = canvas.getContext('2d')!;
      const primary = `#${theme.primary.toString(16).padStart(6, '0')}`;
      const accent = `#${theme.accent.toString(16).padStart(6, '0')}`;
      g.fillStyle = '#071019'; g.fillRect(0, 0, 512, 320);
      g.fillStyle = 'rgba(255,255,255,.035)';
      for (let y = 18; y < 320; y += 22) g.fillRect(16, y, 480, 1);
      g.strokeStyle = primary; g.lineWidth = 4; g.strokeRect(8, 8, 496, 304);
      const panelCopy = ROOM_PANEL_COPY[building.id];
      g.fillStyle = primary; g.font = 'bold 24px monospace';
      g.fillText(side === 'left' ? panelCopy.leftTitle : panelCopy.rightTitle, 28, 48);
      g.fillStyle = '#dce9f4'; g.font = '16px monospace';
      g.fillText(side === 'left' ? theme.label : building.code, 28, 80);
      g.strokeStyle = accent; g.lineWidth = 3; g.beginPath();
      for (let x = 0; x <= 440; x += 8) { const y = 165 + Math.sin(x * 0.045) * (side === 'left' ? 24 : 36) + Math.sin(x * 0.12) * 8; if (x === 0) g.moveTo(28 + x, y); else g.lineTo(28 + x, y); }
      g.stroke();
      g.fillStyle = accent; g.font = 'bold 16px monospace';
      g.fillText(side === 'left' ? panelCopy.leftStatus : panelCopy.rightStatus, 28, 235);
      g.fillStyle = '#8295a8'; g.font = '12px monospace'; g.fillText(panelCopy.footer, 28, 270);
      const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; textures.push(tex);
      const x = side === 'left' ? -4.79 : 4.79;
      box(0.14, 1.62, 2.35, 0x080d14, x, 2.0, -1.35, { metalness: 0.85, roughness: 0.3 });
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(2.16, 1.35), addMaterial(new THREE.MeshBasicMaterial({ map: tex })));
      plane.position.set(side === 'left' ? -4.70 : 4.70, 2.0, -1.35); plane.rotation.y = side === 'left' ? Math.PI / 2 : -Math.PI / 2; scene.add(plane);
      box(0.035, 1.45, 0.04, side === 'left' ? theme.primary : theme.accent, side === 'left' ? -4.61 : 4.61, 2.0, -2.55, { emissive: side === 'left' ? theme.primary : theme.accent, emissiveIntensity: 0.8 });
    };
    makeWallGraphic('left'); makeWallGraphic('right');

    // One primary interactive terminal. Before completion it presents the CTF; after
    // completion the same physical display transforms into the unlocked evidence dataset.
    const ctfScreen = makeScreenTexture('ctf');
    const dataScreen = makeScreenTexture('dataset');
    const scoreScreen = makeScreenTexture('scoreboard');
    const datasetUnlocked = Boolean(visibleCTF?.completed);
    const activeScreenTexture = datasetUnlocked ? dataScreen.tex : ctfScreen.tex;
    const terminalAccent = datasetUnlocked ? theme.primary : theme.accent;
    const stationX = 0;
    const stationPos = new THREE.Vector3(stationX, 1.85, -4.12);

    // Rugged single-screen console with a deep frame, status lights, vents and access reader.
    box(3.7, 2.28, 0.34, 0x080d14, stationX, 2.05, -4.48, { metalness: 0.88, roughness: 0.28 });
    box(3.48, 0.06, 0.07, terminalAccent, stationX, 3.17, -4.28, { emissive: terminalAccent, emissiveIntensity: 1.15 });
    for (const dx of [-1.78, 1.78]) {
      box(0.055, 1.76, 0.06, datasetUnlocked ? theme.primary : theme.accent, stationX + dx, 2.04, -4.27, { emissive: datasetUnlocked ? theme.primary : theme.accent, emissiveIntensity: 0.95 });
      for (let i = 0; i < 3; i++) {
        const indicatorColor = datasetUnlocked ? theme.primary : (i === 0 ? 0x34d399 : theme.accent);
        box(0.075, 0.075, 0.045, indicatorColor, stationX + dx, 1.18 + i * 0.16, -4.25, { emissive: indicatorColor, emissiveIntensity: 1.1 });
      }
    }
    for (let vent = 0; vent < 5; vent++) box(0.2, 0.025, 0.035, 0x64748b, stationX - 0.48 + vent * 0.24, 0.88, -4.26, { metalness: 0.85, roughness: 0.28 });
    const mainScreen = new THREE.Mesh(new THREE.PlaneGeometry(3.36, 1.82), addMaterial(new THREE.MeshBasicMaterial({ map: activeScreenTexture })));
    mainScreen.position.set(stationX, 2.06, -4.285); scene.add(mainScreen);

    const labelCanvas = document.createElement('canvas'); labelCanvas.width = 640; labelCanvas.height = 96;
    const lctx = labelCanvas.getContext('2d')!; lctx.fillStyle = '#071019'; lctx.fillRect(0, 0, 640, 96);
    lctx.fillStyle = `#${theme.primary.toString(16).padStart(6, '0')}`; lctx.font = 'bold 30px monospace'; lctx.textAlign = 'center';
    lctx.fillText(datasetUnlocked ? '02 // EVIDENCE DATASET' : '01 // CTF CHALLENGE TERMINAL', 320, 58);
    const labelTex = new THREE.CanvasTexture(labelCanvas); labelTex.colorSpace = THREE.SRGBColorSpace; textures.push(labelTex);
    const label = new THREE.Mesh(new THREE.PlaneGeometry(3.15, 0.47), addMaterial(new THREE.MeshBasicMaterial({ map: labelTex, transparent: true })));
    label.position.set(stationX, 3.38, -4.30); scene.add(label);

    // A small physical access reader reinforces the state change without adding another screen.
    box(0.48, 0.26, 0.12, 0x101722, 2.15, 0.83, -3.82, { metalness: 0.82, roughness: 0.3 });
    box(0.29, 0.045, 0.035, datasetUnlocked ? 0x34d399 : 0xfbbf24, 2.15, 0.88, -3.745, { emissive: datasetUnlocked ? 0x34d399 : 0xfbbf24, emissiveIntensity: 1.1 });
    interactive.push({ type: datasetUnlocked ? 'dataset' : 'ctf', pos: stationPos, ctf: visibleCTF });
    // Keep the player in front of the terminal rather than walking through the console mesh.
    addBlocker(-1.92, 1.92, -4.78, -4.26);
    pointLight(terminalAccent, 5.5, 4.8, stationX, 2.25, -3.45);

    // Additional low-profile set dressing: labeled utility rails and small hardware modules
    // add texture while keeping the center walking lane clear.
    for (const side of [-1, 1]) {
      const x = side * 4.48;
      box(0.11, 1.12, 0.42, 0x0b121c, x, 1.45, -3.0, { metalness: 0.82, roughness: 0.32 });
      box(0.035, 0.76, 0.035, theme.accent, x + (side < 0 ? 0.07 : -0.07), 1.48, -3.0, { emissive: theme.accent, emissiveIntensity: 0.85 });
      for (let i = 0; i < 4; i++) box(0.045, 0.045, 0.045, i === 0 ? 0x34d399 : theme.primary, x + (side < 0 ? 0.08 : -0.08), 1.12 + i * 0.2, -2.78, { emissive: i === 0 ? 0x34d399 : theme.primary, emissiveIntensity: 0.75 });
    }

    // Building-specific set dressing. Keep the central route clear and make each room immediately recognizable.
    if (building.id === 'sports') {
      // A compact futuristic training court: painted markings, ball rack, arena banners and a lit wall hoop.
      const courtMat = addMaterial(new THREE.MeshBasicMaterial({ color: theme.accent, transparent: true, opacity: 0.88 }));
      const courtLines = new THREE.Group();
      const line = (w: number, d: number, x: number, z: number) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.022, d), courtMat); m.position.set(x, 0.035, z); courtLines.add(m); };
      line(6.0, 0.035, 0, 0); line(0.035, 4.7, 0, 0); line(2.1, 0.035, 0, -2.35); line(2.1, 0.035, 0, 2.35);
      const arc = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.022, 6, 36, Math.PI), courtMat); arc.rotation.x = -Math.PI / 2; arc.position.set(0, 0.04, -0.1); courtLines.add(arc); scene.add(courtLines);
      // Backboard and hoop sit above the screen wall; a compact scoreboard reads as an arena feature.
      box(1.15, 0.66, 0.09, 0xdce8f2, -2.45, 3.28, -4.0, { metalness: 0.45, roughness: 0.25, emissive: theme.primary, emissiveIntensity: 0.08 });
      box(0.82, 0.045, 0.045, theme.accent, -2.45, 2.97, -3.92, { emissive: theme.accent, emissiveIntensity: 1.1 });
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 8, 24), addMaterial(new THREE.MeshStandardMaterial({ color: theme.accent, metalness: 0.85, emissive: theme.accent, emissiveIntensity: 0.6 })));
      hoop.rotation.x = Math.PI / 2; hoop.position.set(-2.45, 2.93, -3.73); scene.add(hoop);
      const net = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.15, 0.3, 10, 1, true), addMaterial(new THREE.MeshBasicMaterial({ color: 0xe2e8f0, wireframe: true, transparent: true, opacity: 0.55 })));
      net.position.set(-2.45, 2.76, -3.73); scene.add(net);
      const scoreMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.42), addMaterial(new THREE.MeshBasicMaterial({ map: scoreScreen.tex })));
      scoreMesh.position.set(3.55, 2.72, -4.08); scene.add(scoreMesh);
      // Side equipment pods, kept close to the walls to preserve the playable lane.
      addBlocker(-4.12, -3.0, 0.12, 1.12);
      addBlocker(3.0, 4.12, 0.12, 1.12);
      for (const x of [-3.55, 3.55]) {
        box(1.0, 0.65, 0.72, 0x111a26, x, 0.34, 0.65, { metalness: 0.78, roughness: 0.28 });
        box(0.84, 0.055, 0.045, theme.accent, x, 0.67, 0.26, { emissive: theme.accent, emissiveIntensity: 0.9 });
        box(0.7, 0.18, 0.04, theme.primary, x, 1.05, 0.25, { emissive: theme.primary, emissiveIntensity: 0.6 });
      }
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 14), addMaterial(new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.72, emissive: 0x7c2d12, emissiveIntensity: 0.16 })));
      ball.position.set(-3.48, 0.25, -0.15); scene.add(ball);
      const ballSeam = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.012, 6, 24), addMaterial(new THREE.MeshBasicMaterial({ color: 0x27160b })));
      ballSeam.position.copy(ball.position); ballSeam.rotation.x = Math.PI / 2; scene.add(ballSeam);
      // Arena identity banners on either side of the display wall.
      for (const x of [-3.55, 3.55]) {
        box(0.78, 1.5, 0.07, 0x0a111b, x, 2.55, -4.3, { metalness: 0.65 });
        box(0.055, 1.25, 0.035, theme.accent, x, 2.55, -4.24, { emissive: theme.accent, emissiveIntensity: 1.0 });
        box(0.45, 0.055, 0.035, theme.primary, x, 2.85, -4.23, { emissive: theme.primary, emissiveIntensity: 0.8 });
        box(0.45, 0.055, 0.035, theme.primary, x, 2.25, -4.23, { emissive: theme.primary, emissiveIntensity: 0.8 });
      }
    } else if (building.id === 'hospital') {
      // Medical bay: diagnostic bed, bedside monitor, cabinet and illuminated clinical cross.
      addBlocker(-3.05, -1.12, 0.15, 1.35);
      addBlocker(-3.98, -3.12, -0.12, 0.42);
      addBlocker(3.12, 4.02, 0.2, 1.05);
      box(1.65, 0.36, 0.95, 0xd7e8e8, -2.1, 0.38, 0.75, { metalness: 0.15, roughness: 0.35 });
      box(1.38, 0.08, 0.72, 0x7dd3c7, -2.1, 0.61, 0.75, { emissive: 0x0f766e, emissiveIntensity: 0.28 });
      box(0.08, 0.3, 0.05, theme.accent, -1.38, 0.86, 0.75, { emissive: theme.accent, emissiveIntensity: 0.7 });
      box(0.75, 0.82, 0.2, 0x102b35, -3.55, 1.25, 0.25, { metalness: 0.7 });
      box(0.62, 0.43, 0.035, 0x06131a, -3.55, 1.36, 0.13, { emissive: theme.primary, emissiveIntensity: 0.2 });
      box(0.42, 0.06, 0.04, theme.primary, -3.55, 1.48, 0.1, { emissive: theme.primary, emissiveIntensity: 1.0 });
      box(0.72, 1.25, 0.55, 0xd7e8e8, 3.55, 0.63, 0.6, { metalness: 0.3 });
      box(0.76, 0.08, 0.6, theme.primary, 3.55, 1.28, 0.6, { emissive: theme.primary, emissiveIntensity: 0.65 });
      box(0.56, 0.12, 0.035, theme.accent, 4.55, 1.75, -0.1, { emissive: theme.accent, emissiveIntensity: 0.9 });
      box(0.12, 0.56, 0.035, theme.accent, 4.55, 1.75, -0.1, { emissive: theme.accent, emissiveIntensity: 0.9 });
    } else if (building.id === 'school') {
      // Compact learning station: teacher console, data board, stacked books and school insignia.
      addBlocker(-3.2, -1.0, 0.2, 1.32);
      addBlocker(-3.98, -3.12, -0.12, 0.42);
      box(2.0, 0.12, 0.82, 0x64748b, -2.1, 0.92, 0.78, { metalness: 0.6 });
      // Mount the schedule board on the left wall, keeping the sightline and walk lane
      // to the central CTF terminal clear. The thin X dimension makes it wall-mounted.
      box(0.08, 0.68, 1.98, 0x0b2533, -4.78, 2.2, 1.2, { emissive: theme.primary, emissiveIntensity: 0.12 });
      box(0.035, 0.42, 1.72, 0x071019, -4.70, 2.2, 1.2, { emissive: theme.primary, emissiveIntensity: 0.25 });
      for (let i = 0; i < 4; i++) box(0.38, 0.08, 0.28, [0x38bdf8, 0xfbbf24, 0x22c55e, 0xc084fc][i], -2.72 + i * 0.4, 1.04, 0.72, { roughness: 0.72 });
      box(0.72, 0.78, 0.12, 0x0b2533, -3.55, 1.7, 0.1, { metalness: 0.6 });
      for (let i = 0; i < 3; i++) box(0.56, 0.055, 0.04, theme.accent, -3.55, 1.45 + i * 0.22, 0.025, { emissive: theme.accent, emissiveIntensity: 0.65 });
      box(0.65, 0.65, 0.08, theme.primary, 3.55, 1.7, -4.25, { emissive: theme.primary, emissiveIntensity: 0.15 });
    } else if (building.id === 'museum') {
      // Archive gallery: plinth, floating artifact and a pair of low illuminated exhibit vitrines.
      addBlocker(1.35, 2.85, 0.12, 1.32);
      addBlocker(-4.12, -3.0, 0.12, 1.14);
      addBlocker(3.0, 4.12, 0.12, 1.14);
      box(1.25, 0.55, 0.95, 0x211733, 2.1, 0.3, 0.72, { metalness: 0.8 });
      const artifact = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), addMaterial(new THREE.MeshStandardMaterial({ color: theme.accent, metalness: 0.75, roughness: 0.2, emissive: theme.accent, emissiveIntensity: 0.7 })));
      artifact.position.set(2.1, 0.92, 0.72); scene.add(artifact);
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.018, 6, 32), addMaterial(new THREE.MeshBasicMaterial({ color: theme.primary, transparent: true, opacity: 0.9 })));
      halo.position.set(2.1, 1.1, 0.72); halo.rotation.x = Math.PI / 2; scene.add(halo);
      for (const x of [-3.55, 3.55]) {
        box(1.0, 0.75, 0.78, 0x171126, x, 0.38, 0.65, { metalness: 0.85, roughness: 0.22 });
        box(0.92, 0.52, 0.7, 0x6b4a96, x, 0.88, 0.65, { metalness: 0.4, roughness: 0.18, emissive: theme.primary, emissiveIntensity: 0.08 });
        box(0.88, 0.045, 0.72, theme.accent, x, 0.78, 0.65, { emissive: theme.accent, emissiveIntensity: 0.75 });
      }
    } else if (building.id === 'society') {
      // Residential services: miniature apartment frontage, illuminated unit numbers and a parcel shelf.
      addBlocker(-3.78, -2.96, 0.32, 1.08);
      addBlocker(-2.68, -1.86, 0.32, 1.08);
      addBlocker(1.86, 2.68, 0.32, 1.08);
      addBlocker(2.96, 3.78, 0.32, 1.08);
      addBlocker(-4.28, -2.82, -0.48, 0.3);
      for (let i = 0; i < 4; i++) {
        const x = [-3.35, -2.25, 2.25, 3.35][i];
        box(0.72, 1.0, 0.48, 0x291b34, x, 0.52, 0.72, { metalness: 0.7 });
        box(0.48, 0.38, 0.045, i === 1 ? theme.accent : theme.primary, x, 0.68, 0.46, { emissive: i === 1 ? theme.accent : theme.primary, emissiveIntensity: 0.55 });
        box(0.5, 0.045, 0.05, theme.accent, x, 1.12, 0.44, { emissive: theme.accent, emissiveIntensity: 0.65 });
      }
      box(1.35, 0.5, 0.6, 0x24162d, -3.55, 0.28, -0.1, { metalness: 0.65 });
      for (let i = 0; i < 3; i++) box(0.28, 0.24, 0.22, [0x38bdf8, 0xe879f9, 0xfacc15][i], -3.92 + i * 0.36, 0.65, -0.1, { emissive: [0x38bdf8, 0xe879f9, 0xfacc15][i], emissiveIntensity: 0.3 });
      box(0.72, 1.1, 0.12, 0x26172f, 3.55, 0.58, -4.25, { metalness: 0.6 });
      box(0.5, 0.08, 0.04, theme.primary, 3.55, 0.9, -4.17, { emissive: theme.primary, emissiveIntensity: 0.8 });
    }

    // Exit interaction sits at the back of the player, with a clear directional sign.
    const exitCanvas = document.createElement('canvas'); exitCanvas.width = 512; exitCanvas.height = 128;
    const exitCtx = exitCanvas.getContext('2d')!; exitCtx.fillStyle = '#071019'; exitCtx.fillRect(0,0,512,128);
    exitCtx.strokeStyle = '#facc15'; exitCtx.lineWidth = 5; exitCtx.strokeRect(4,4,504,120);
    exitCtx.fillStyle = '#facc15'; exitCtx.font = 'bold 32px monospace'; exitCtx.textAlign = 'center'; exitCtx.fillText('EXIT // COMMUNITY MAP', 256, 78);
    const exitTex = new THREE.CanvasTexture(exitCanvas); textures.push(exitTex);
    const exitLabel = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), addMaterial(new THREE.MeshBasicMaterial({ map: exitTex })));
    exitLabel.position.set(0, 3.05, 4.48); exitLabel.rotation.y = Math.PI; scene.add(exitLabel);
    interactive.push({ type: 'exit', pos: new THREE.Vector3(0, 1.65, 4.45) });

    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not move the player underneath a modal or steal keystrokes from form controls.
      if (document.querySelector('[aria-modal="true"]')) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, button, [role="dialog"]')) return;
      const s = stateRef.current;
      if (['KeyW','ArrowUp'].includes(e.code)) s.keys.forward = true;
      if (['KeyS','ArrowDown'].includes(e.code)) s.keys.backward = true;
      if (['KeyA','ArrowLeft'].includes(e.code)) s.keys.left = true;
      if (['KeyD','ArrowRight'].includes(e.code)) s.keys.right = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') { s.keys.sprint = true; setSprinting(true); }
      if (e.code === 'KeyE' && s.prompt) interact(s.prompt);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (['KeyW','ArrowUp'].includes(e.code)) s.keys.forward = false;
      if (['KeyS','ArrowDown'].includes(e.code)) s.keys.backward = false;
      if (['KeyA','ArrowLeft'].includes(e.code)) s.keys.left = false;
      if (['KeyD','ArrowRight'].includes(e.code)) s.keys.right = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') { s.keys.sprint = false; setSprinting(false); }
    };
    const handleWindowBlur = () => {
      const s = stateRef.current;
      s.keys.forward = s.keys.backward = s.keys.left = s.keys.right = s.keys.sprint = false;
      setSprinting(false);
    };
    function interact(prompt: Prompt) {
      if (!prompt) return;
      sound.playClick();
      if (document.pointerLockElement === renderer.domElement) document.exitPointerLock?.();
      if (prompt.type === 'ctf' && prompt.target) callbacksRef.current.onInteractCTF(prompt.target);
      else if (prompt.type === 'dataset' && visibleCTF?.completed) callbacksRef.current.onOpenDataset?.();
      else if (prompt.type === 'exit') callbacksRef.current.onReturnToMap();
    }
    const handleMouseDown = (e: MouseEvent) => { state.mouseDown = true; state.lastX = e.clientX; state.lastY = e.clientY; };
    const handleMouseUp = () => { state.mouseDown = false; };
    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === renderer.domElement) { state.yaw -= e.movementX * 0.002; state.pitch -= e.movementY * 0.002; }
      else if (state.mouseDown) { state.yaw -= (e.clientX - state.lastX) * 0.003; state.pitch -= (e.clientY - state.lastY) * 0.003; state.lastX = e.clientX; state.lastY = e.clientY; }
    };
    const handleCanvasClick = () => { if (document.pointerLockElement !== renderer.domElement) renderer.domElement.requestPointerLock?.(); };
    const resize = () => { if (!container.clientWidth || !container.clientHeight) return; camera.aspect = container.clientWidth / container.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth, container.clientHeight); };
    window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp); window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp); window.addEventListener('resize', resize);
    renderer.domElement.addEventListener('mousedown', handleMouseDown); renderer.domElement.addEventListener('click', handleCanvasClick);

    let frame = 0;
    let last = 0;
    let elapsed = 0;
    let lastScreenDraw = 0;
    let lastPromptKey = '';
    // Reuse movement vectors rather than allocating several THREE.Vector3 objects
    // on every animation frame.
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const move = new THREE.Vector3();
    const animate = (now: number) => {
      frame = requestAnimationFrame(animate);
      // A stable 30 FPS cap cuts GPU/CPU use substantially without affecting controls.
      if (now - last < 1000 / 30) return;
      const dt = Math.min((now - last) / 1000 || 0, 0.05); last = now; elapsed += dt;
      forward.set(-Math.sin(state.yaw), 0, -Math.cos(state.yaw));
      right.set(Math.cos(state.yaw), 0, -Math.sin(state.yaw));
      move.set(0, 0, 0);
      if (state.keys.forward) move.add(forward); if (state.keys.backward) move.sub(forward);
      if (state.keys.right) move.add(right); if (state.keys.left) move.sub(right);
      if (move.lengthSq() > 0) {
        move.normalize().multiplyScalar((state.keys.sprint ? 4.8 : 2.8) * dt);
        const isBlocked = (x: number, z: number) => blockers.some((b) => x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ);
        const nextX = THREE.MathUtils.clamp(state.pos.x + move.x, -4.35, 4.35);
        const nextZ = THREE.MathUtils.clamp(state.pos.z + move.z, -4.25, 4.25);
        // Resolve each axis separately so players can slide along furniture instead of sticking.
        if (!isBlocked(nextX, state.pos.z)) state.pos.x = nextX;
        if (!isBlocked(state.pos.x, nextZ)) state.pos.z = nextZ;
      }
      state.pos.x = THREE.MathUtils.clamp(state.pos.x, -4.35, 4.35);
      state.pos.z = THREE.MathUtils.clamp(state.pos.z, -4.25, 4.25);
      camera.position.copy(state.pos);
      camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = THREE.MathUtils.clamp(state.pitch, -0.75, 0.75);

      let nearest: Prompt = null; let nearestDist = 1.8;
      for (const target of interactive) {
        const dist = state.pos.distanceTo(target.pos);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = target.type === 'ctf'
            ? { type: 'ctf', target: target.ctf, message: target.ctf?.completed ? 'OPEN CTF // REVIEW SECURED CHALLENGE' : 'OPEN CTF // START CHALLENGE' }
            : target.type === 'dataset'
              ? { type: 'dataset', message: visibleCTF?.completed ? 'OPEN DATASET // INSPECT BUILDING RECORDS' : 'DATASET LOCKED // SOLVE THE CTF FIRST' }
              : { type: 'exit', message: 'EXIT TO COMMUNITY MAP' };
        }
      }
      const promptKey = nearest ? `${nearest.type}:${nearest.target?.id ?? ''}:${nearest.message}` : '';
      if (promptKey !== lastPromptKey) {
        lastPromptKey = promptKey;
        state.prompt = nearest;
        setActivePrompt(nearest);
        if (nearest) sound.playHover();
      }
      // CanvasTexture.needsUpdate triggers a GPU texture upload. Redraw the one
      // animated terminal at 4 Hz; the scoreboard is static after initialization.
      if (now - lastScreenDraw >= 250) {
        if (datasetUnlocked) dataScreen.draw(elapsed); else ctfScreen.draw(elapsed);
        lastScreenDraw = now;
      }
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      if (document.pointerLockElement === renderer.domElement) document.exitPointerLock?.();
      window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); window.removeEventListener('resize', resize);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown); renderer.domElement.removeEventListener('click', handleCanvasClick);
      if (document.pointerLockElement === renderer.domElement) document.exitPointerLock?.();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
      scene.traverse((obj) => { const mesh = obj as THREE.Mesh; if (mesh.geometry) mesh.geometry.dispose(); });
      materials.forEach((m) => m.dispose()); textures.forEach((t) => t.dispose());
    };
  }, [building.id, visibleCTF?.completed, theme]);

  return (
    <div className="relative w-full h-full flex-1 overflow-hidden select-none bg-black">
      <div ref={mountRef} className="w-full h-full cursor-crosshair" />
      <div className="absolute top-4 left-4 z-20 bg-[#081019]/90 border border-white/10 p-3 rounded-lg font-mono-code text-xs backdrop-blur-md pointer-events-none">
        <div className="text-white font-bold tracking-widest">{building.name} <span style={{ color: `#${theme.primary.toString(16).padStart(6, '0')}` }}>// {theme.label}</span></div>
        <div className="text-slate-300 mt-1 text-[10px]">{theme.detail}</div>
        {sprinting && <div className="mt-2 text-[10px] text-amber-300 flex items-center gap-1"><Zap size={10} className="inline"/> SPRINT ACTIVE</div>}
      </div>
      <div className="absolute top-4 right-4 z-20 flex gap-2 pointer-events-none">
        <div className="bg-[#081019]/90 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-slate-300 flex items-center gap-2">{visibleCTF?.completed ? <Database size={14} style={{ color: `#${theme.primary.toString(16).padStart(6, '0')}` }}/> : <FileSearch size={14} style={{ color: `#${theme.accent.toString(16).padStart(6, '0')}` }}/>} {visibleCTF?.completed ? 'SINGLE SCREEN // DATASET' : 'SINGLE SCREEN // CTF'}</div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className={`w-5 h-5 rounded-full border ${activePrompt ? 'border-amber-300 scale-125' : 'border-white/40'} flex items-center justify-center`}><div className={`w-1 h-1 rounded-full ${activePrompt ? 'bg-amber-300' : 'bg-white/60'}`} /></div>
      </div>
      {activePrompt && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 font-mono-code text-center">
          <button onClick={() => {
            sound.playClick();
            if (activePrompt.type === 'ctf' && activePrompt.target) onInteractCTF(activePrompt.target);
            else if (activePrompt.type === 'dataset' && visibleCTF?.completed) onOpenDataset?.();
            else onReturnToMap();
          }} className="px-5 py-3 rounded-lg bg-[#081019]/95 border-2 border-amber-300 text-amber-200 font-bold text-xs tracking-wide shadow-[0_0_24px_rgba(251,191,36,0.25)] hover:bg-amber-300 hover:text-black transition-colors flex items-center gap-3">
            <span className="px-2 py-1 rounded bg-black/50 border border-amber-300/40">[E] / CLICK</span><span>{activePrompt.message}</span>
          </button>
        </div>
      )}
      <div className="absolute bottom-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono-code text-slate-300 bg-[#081019]/90 px-4 py-2 rounded-lg border border-white/10 backdrop-blur-md">
        <div>WASD MOVE · MOUSE LOOK · SHIFT SPRINT · E INTERACT</div>
        <div className="flex items-center gap-2">{visibleCTF?.completed ? <CheckCircle2 size={13} className="text-emerald-400"/> : <Lock size={13} className="text-amber-300"/>}<span>{visibleCTF?.completed ? 'CTF SECURED' : 'CTF READY'}</span><span className="text-slate-500">·</span><span>COMPACT ROOM 01/01</span></div>
      </div>
    </div>
  );
};

export default ThreeRoomFPP;
