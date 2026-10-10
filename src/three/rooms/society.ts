import * as THREE from 'three';
import { eSkyTexture } from './kit';
import { BuildCtx } from './hospital';

export function buildSociety(ctx: BuildCtx, _ctfs: unknown, ctfGroups: THREE.Group[]): void {
  const { scene, dims, textures, animated, fromObject, addRect } = ctx;
  const RW = dims.width, RL = dims.length, RH = dims.height;

  const sky = eSkyTexture('society', textures);
  const winPos = [-5.5, -1.5, 2.5, 6.5];
  winPos.forEach((mx) => {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.7, 0.06), new THREE.MeshStandardMaterial({ color: 0x2a1936, metalness: 0.55 }));
    frame.position.set(mx, 2.5, -RL / 2 + 0.10); scene.add(frame); fromObject(frame, 0.02);
    const view = new THREE.Mesh(new THREE.PlaneGeometry(2.85, 1.55), new THREE.MeshBasicMaterial({ map: sky }));
    view.position.set(mx, 2.5, -RL / 2 + 0.14); scene.add(view);
  });

  const fans = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 1.35), new THREE.MeshStandardMaterial({ color: 0x2a1a36, metalness: 0.75 }));
    blade.rotation.y = (i * Math.PI) / 2;
    blade.position.set(0, 0, 0.68).applyAxisAngle(new THREE.Vector3(0, 1, 0), (i * Math.PI) / 2);
    fans.add(blade);
  }
  fans.position.set(0, RH - 0.22, 0);
  scene.add(fans);

  const units = [
    { x: -RW / 2 + 0.35, z: -1.2, label: 'UNIT 404 [SEALED]', sub: 'CITIZEN EXPUNGED', color: 0xef4444 },
    { x: RW / 2 - 0.35, z: -1.2, label: 'UNIT 405 [VACANT]', sub: 'DOOR LOCKED', color: 0xfacc15 },
    { x: -RW / 2 + 0.35, z: 3.0, label: 'UNIT 401 [OCCUPIED]', sub: 'LOG: NOMINAL', color: 0x34d399 },
    { x: RW / 2 - 0.35, z: 3.0, label: 'UNIT 402 [QUIET]', sub: 'NO SIGNAL', color: 0x64748b },
  ];
  units.forEach((u) => {
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.28, 2.8, 1.8), new THREE.MeshStandardMaterial({ color: 0x2a1936, metalness: 0.8 }));
    door.position.set(u.x, 1.4, u.z);
    scene.add(door);
    fromObject(door, 0.1);
  });

  const kiosk = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.1, 1.3), new THREE.MeshStandardMaterial({ color: 0x22102e, metalness: 0.78 }));
  kiosk.position.set(0, 1.05, -1.0);
  scene.add(kiosk);
  fromObject(kiosk, 0.15);

  const cables = new THREE.Group();
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2;
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 3.2, 6), new THREE.MeshStandardMaterial({ color: 0x1a0f24, metalness: 0.6 }));
    cable.position.set(Math.cos(ang) * 0.65, 0.8, Math.sin(ang) * 0.65);
    cable.rotation.x = Math.random() * 0.15;
    cables.add(cable);
  }
  cables.position.set(0, 1.6, -1.0);
  scene.add(cables);

  const vent1 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.12, 10), new THREE.MeshStandardMaterial({ color: 0x301a3e, metalness: 0.5 }));
  vent1.position.set(-3.5, RH - 0.08, -2.0);
  scene.add(vent1);
  const vent2 = vent1.clone(); vent2.position.set(3.5, RH - 0.08, 2.0); scene.add(vent2);

  const neons: THREE.Mesh[] = [];
  const neonTexts = ['ZONE Y', 'MANU', 'COMPLIANCE', 'SURVEILLANCE'];
  neonTexts.forEach((txt, i) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.fillRect(0, 0, 256, 64);
    ctx.font = 'bold 28px Rajdhani, sans-serif';
    ctx.textAlign = 'center';
    const grad = ctx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, '#d946ef'); grad.addColorStop(0.5, '#facc15'); grad.addColorStop(1, '#d946ef');
    ctx.strokeStyle = grad; ctx.lineWidth = 4; ctx.strokeText(txt, 128, 42);
    ctx.fillStyle = '#fff'; ctx.fillText(txt, 128, 42);
    const tex = new THREE.CanvasTexture(canvas); textures.push(tex);
    const neon = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.55), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    neon.position.set((i - 1.5) * 2.5, 2.3, -RL / 2 + 0.15);
    scene.add(neon);
    neons.push(neon);
  });

  const dust = new THREE.BufferGeometry();
  const n = 70, arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    arr[i * 3] = (Math.random() - 0.5) * RW * 0.92;
    arr[i * 3 + 1] = 0.12 + Math.random() * (RH - 0.5);
    arr[i * 3 + 2] = (Math.random() - 0.5) * RL * 0.92;
  }
  dust.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  scene.add(new THREE.Points(dust, new THREE.PointsMaterial({ color: 0xf0a5ff, size: 0.035, transparent: true, opacity: 0.45 })));

  animated.push({
    update(time) {
      fans.rotation.y = time * 3.2;
      const pos = (dust.attributes.position as THREE.BufferAttribute).array as Float32Array;
      for (let i = 0; i < n; i++) {
        pos[i * 3 + 1] += Math.sin(time * 0.35 + i) * 0.0025;
        pos[i * 3] += Math.cos(time * 0.28 + i * 0.6) * 0.0018;
      }
      (dust.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      neons.forEach((n, i) => {
        (n.material as THREE.MeshBasicMaterial).opacity = 0.75 + Math.sin(time * 1.4 + i) * 0.2;
      });
      ctfGroups.forEach((g) => { if (g) g.rotation.y += 0; });
    }
  });
}