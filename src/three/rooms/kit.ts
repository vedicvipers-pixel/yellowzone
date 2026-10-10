import * as THREE from 'three';
import { BuildingData, CTFData } from '../../types/protocol';

export interface RoomDims { width: number; length: number; height: number }
export interface Atmosphere { bg: number; fogDensity: number; primary: number; accent: number; sky: number; ground: number }
export interface Collider { minX: number; maxX: number; minZ: number; maxZ: number }
export interface AnimatedItem { update(time: number, delta: number): void }

export const ATMOSPHERES: Record<string, Atmosphere> = {
  hospital: { bg: 0x06171d, fogDensity: 0.014, primary: 0x22d3ee, accent: 0x10b981, sky: 0x0d3040, ground: 0x08202a },
  school: { bg: 0x0a1626, fogDensity: 0.015, primary: 0x38bdf8, accent: 0xfbbf24, sky: 0x14314a, ground: 0x0e1b30 },
  museum: { bg: 0x120a22, fogDensity: 0.016, primary: 0xfacc15, accent: 0xa855f7, sky: 0x251242, ground: 0x0e0720 },
  sports: { bg: 0x1a1106, fogDensity: 0.014, primary: 0xf97316, accent: 0xfacc15, sky: 0x3a2010, ground: 0x1a1006 },
  society: { bg: 0x160a1c, fogDensity: 0.017, primary: 0xd946ef, accent: 0xfacc15, sky: 0x2a1438, ground: 0x140a20 },
};

export const ROOM_DIMS: Record<string, RoomDims> = {
  hospital: { width: 18, length: 20, height: 4.8 },
  school: { width: 20, length: 20, height: 5.0 },
  museum: { width: 22, length: 22, height: 6.2 },
  sports: { width: 24, length: 20, height: 6.0 },
  society: { width: 18, length: 20, height: 4.6 },
};

export const WALL_COLORS: Record<string, number> = {
  hospital: 0x103342,
  school: 0x162b42,
  museum: 0x20153a,
  sports: 0x2e2216,
  society: 0x2a1936,
};

export function disposeThree(scene: THREE.Scene, disposables: { dispose(): void }[]) {
  scene.traverse((obj) => {
    const m = (obj as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(m)) m.forEach((mm) => mm && mm.dispose());
    else if (m && 'dispose' in m) (m as THREE.Material).dispose();
    const g = (obj as THREE.Mesh).geometry as THREE.BufferGeometry | undefined;
    if (g && g.dispose) g.dispose();
  });
  disposables.forEach((d) => { try { d.dispose(); } catch {} });
}

export function canvasTexture(w: number, h: number, draw: (c: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  draw(ctx, canvas);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function billboardSprite(text: string, sub: string, colorHex: string, texs: THREE.Texture[]): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgba(10,14,22,0.92)';
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 504, 248);
  ctx.fillStyle = colorHex;
  ctx.font = 'bold 30px Rajdhani, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, 256, 104);
  ctx.fillStyle = '#d7e1f0';
  ctx.font = '18px JetBrains Mono, monospace';
  ctx.fillText(sub, 256, 168);
  const tex = new THREE.CanvasTexture(canvas);
  texs.push(tex);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  texs.push(mat as unknown as THREE.Texture);
  const spr = new THREE.Sprite(mat);
  return spr;
}

export function makeRoomKit(scene: THREE.Scene, building: BuildingData): {
  dims: RoomDims; atmo: Atmosphere; wallColor: number;
  animated: AnimatedItem[]; colliders: Collider[]; interactables: THREE.Object3D[];
  textures: THREE.Texture[]; disposables: THREE.Texture[];
  addRect(minX: number, maxX: number, minZ: number, maxZ: number): void;
  fromObject(obj: THREE.Object3D, pad?: number): void;
} {
  const dims = ROOM_DIMS[building.id] ?? { width: 16, length: 18, height: 5 };
  const atmo = ATMOSPHERES[building.id] ?? ATMOSPHERES.hospital;
  const wallColor = WALL_COLORS[building.id] ?? 0x1a2432;
  const animated: AnimatedItem[] = [];
  const colliders: Collider[] = [];
  const interactables: THREE.Object3D[] = [];
  const textures: THREE.Texture[] = [];
  const disposables: THREE.Texture[] = [];
  function addRect(minX: number, maxX: number, minZ: number, maxZ: number) {
    colliders.push({ minX, maxX, minZ, maxZ });
  }
  function fromObject(obj: THREE.Object3D, pad = 0.05) {
    const box = new THREE.Box3().setFromObject(obj);
    addRect(box.min.x - pad, box.max.x + pad, box.min.z - pad, box.max.z + pad);
  }
  return { dims, atmo, wallColor, animated, colliders, interactables, textures, disposables, addRect, fromObject };
}

export function eSkyTexture(id: string, texs: THREE.Texture[]): THREE.Texture {
  const h = 512, w = 1024;
  return canvasTexture(w, h, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    if (id === 'hospital') {
      g.addColorStop(0, '#020c12');
      g.addColorStop(0.45, '#0a2a3a');
      g.addColorStop(0.75, '#102f44');
      g.addColorStop(1, '#071420');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#06121a';
      for (let i = 0; i < 10; i++) {
        const x = (i / 10) * w + (Math.random() * 60);
        const hh = 40 + Math.random() * 120;
        ctx.fillRect(x % w, h - hh - 0, 34 + Math.random() * 60, hh);
        for (let f = 2; f < hh; f += 8) {
          ctx.fillStyle = Math.random() > 0.4 ? '#0b3a4d' : '#052030';
          ctx.fillRect((x % w) + 6, h - hh + f, 8, 4);
          ctx.fillStyle = '#06121a';
        }
      }
      ctx.fillStyle = 'rgba(239,68,68,0.55)';
      for (let i = 0; i < 3; i++) {
        const cx = 180 + i * 300; const cy = 120 + Math.sin(i) * 20;
        ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(239,68,68,0.18)';
        ctx.beginPath(); ctx.arc(cx, cy, 40, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(239,68,68,0.55)';
      }
    } else if (id === 'school') {
      g.addColorStop(0, '#071a2c');
      g.addColorStop(0.40, '#132e4a');
      g.addColorStop(0.60, '#e08a10'); g.addColorStop(0.75, '#f07a0a'); g.addColorStop(1, '#4a2a0a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.beginPath(); ctx.arc(w - 260, 185, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,190,100,0.18)'; ctx.beginPath(); ctx.arc(w - 260, 185, 220, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#091524';
      for (let i = 0; i < 6; i++) {
        const x = 160 + i * 130; const hh = 70 + Math.random() * 30;
        ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x - 28, h - hh); ctx.lineTo(x + 28, h - hh); ctx.lineTo(x + 18, h); ctx.fill();
      }
    } else if (id === 'museum') {
      ctx.fillStyle = '#050210'; ctx.fillRect(0, 0, w, h);
      const gg = ctx.createRadialGradient(w * 0.5, h * 0.18, 30, w * 0.5, h * 0.18, 700);
      gg.addColorStop(0, 'rgba(250,204,21,0.45)'); gg.addColorStop(0.25, 'rgba(168,85,247,0.34)'); gg.addColorStop(0.55, 'rgba(30,10,68,0.95)'); gg.addColorStop(1, '#050210');
      ctx.fillStyle = gg; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 500; i++) {
        const x = Math.random() * w, y = Math.random() * h * 0.86;
        const s = Math.random() * 1.1;
        ctx.fillStyle = `rgba(255,255,255,${0.18 + Math.random() * 0.9})`;
        ctx.fillRect(x, y, s, s);
      }
      ctx.strokeStyle = 'rgba(250,204,21,0.85)'; ctx.lineWidth = 0.6;
      for (let c = 0; c < 4; c++) {
        const cx = 360 + (c * 160); ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.04) { const r = 160 + Math.sin(a * 3 + c) * 14; const px = cx + Math.cos(a) * r; const py = h * 0.38 + Math.sin(a) * r; if (a < 0.05) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
        ctx.stroke();
      }
    } else if (id === 'sports') {
      g.addColorStop(0, '#0b0805'); g.addColorStop(0.42, '#1a1208'); g.addColorStop(0.72, '#2b1a0a'); g.addColorStop(1, '#100a05');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      for (let i = 0; i < 5; i++) {
        const x = 140 + i * 190, y = 150 + (i % 2 === 0 ? 0 : 22);
        ctx.save(); ctx.translate(x, y);
        ctx.rotate(0.35);
        ctx.fillRect(-34, -3, 68, 6); ctx.fillRect(-3, -34, 6, 68);
        ctx.restore();
        ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.beginPath(); ctx.arc(x, y, 90, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.95)';
      }
    } else {
      g.addColorStop(0, '#0e0716'); g.addColorStop(0.5, '#1a0c2a'); g.addColorStop(0.75, '#140a22'); g.addColorStop(1, '#070510');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(217,70,239,0.22)';
      for (let i = 0; i < 18; i++) { const x = (i * 57) % w, hh = 60 + (i * 11) % 150; ctx.fillRect(x, h - hh, 10, hh); }
      ctx.fillStyle = 'rgba(250,204,21,0.85)';
      for (let i = 0; i < 22; i++) { const x = Math.random() * w, y = 12 + Math.random() * (h * 0.85); ctx.fillRect(x, y, 1, 1); }
      ctx.strokeStyle = 'rgba(250,204,21,0.26)'; ctx.lineWidth = 0.7;
      for (let y = h - 120; y < h - 8; y += 22) { ctx.beginPath(); ctx.moveTo(0, y); for (let x = 0; x < w; x += 90) { ctx.lineTo(x + 8, y + Math.sin((x + y) * 0.02) * 3); } ctx.stroke(); }
    }
  });
}

export function floorPatternTexture(id: string): THREE.CanvasTexture {
  const s = 512;
  return canvasTexture(s, s, (ctx) => {
    if (id === 'hospital') {
      ctx.fillStyle = '#0b1e26'; ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = '#132f3c'; ctx.lineWidth = 2;
      for (let x = 0; x <= s; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, s); ctx.stroke(); }
      for (let y = 0; y <= s; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(s, y); ctx.stroke(); }
      ctx.fillStyle = 'rgba(52,211,153,0.085)'; ctx.fillRect(208, 0, 96, s);
      ctx.fillStyle = 'rgba(52,211,153,0.14)'; ctx.fillRect(240, 0, 28, s);
      ctx.fillStyle = 'rgba(255,255,255,0.025)'; for (let i = 0; i < 5; i++) { ctx.fillRect(22 + i * 100, 22 + i * 70, 12, 12); }
    } else if (id === 'school') {
      ctx.fillStyle = '#101c2a'; ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = '#1d2f45'; ctx.lineWidth = 2; ctx.strokeRect(0, 0, s, s);
      for (let x = 0; x <= s; x += 128) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, s); ctx.stroke(); }
      for (let y = 0; y <= s; y += 128) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(s, y); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(56,189,248,0.18)'; ctx.lineWidth = 1.5; ctx.strokeRect(32, 32, s - 64, s - 64);
      ctx.fillStyle = 'rgba(122,255,122,0.03)'; ctx.beginPath(); ctx.arc(s * 0.5, s * 0.5, 60, 0, Math.PI * 2); ctx.fill();
    } else if (id === 'museum') {
      ctx.fillStyle = '#0d0a18'; ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = '#2d2248'; ctx.lineWidth = 1.5; ctx.strokeRect(16, 16, 480, 480);
      ctx.strokeStyle = 'rgba(234,179,8,0.85)'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(s / 2, s / 2, 170, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(168,85,247,0.28)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(s / 2, s / 2, 142, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1; ctx.strokeRect(s / 2 - 90, s / 2 - 90, 180, 180);
    } else if (id === 'sports') {
      ctx.fillStyle = '#181008'; ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = 'rgba(226,114,40,0.06)'; ctx.fillRect(12, 120, s - 24, 18);
      ctx.fillStyle = 'rgba(250,204,21,0.07)'; ctx.fillRect(120, 12, 18, s - 24);
      ctx.strokeStyle = '#3a2412'; ctx.lineWidth = 2; ctx.strokeRect(18, 18, 476, 476);
      ctx.strokeStyle = 'rgba(232,121,28,0.55)'; ctx.lineWidth = 6; ctx.strokeRect(32, 32, 448, 448);
      ctx.strokeStyle = 'rgba(250,240,90,0.65)'; ctx.lineWidth = 2.2; ctx.strokeRect(72, 72, 368, 368);
      ctx.strokeStyle = 'rgba(250,204,21,0.14)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(s / 2, s / 2, 58, 0, Math.PI * 2); ctx.stroke();
    } else {
      ctx.fillStyle = '#140c1c'; ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = '#261933'; ctx.lineWidth = 1.5;
      for (let x = 0; x <= s; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, s); ctx.stroke(); }
      for (let y = 0; y <= s; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(s, y); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(217,70,239,0.13)'; ctx.lineWidth = 2; ctx.strokeRect(64, 64, 384, 384);
      ctx.fillStyle = 'rgba(217,70,239,0.03)'; ctx.fillRect(64, 64, 384, 384);
    }
  });
}

export type CTFKind = CTFData;
