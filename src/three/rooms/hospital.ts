import * as THREE from 'three';
import { CTFData } from '../../types/protocol';
import { billboardSprite, eSkyTexture, AnimatedItem, Collider } from './kit';

export interface BuildCtx {
  scene: THREE.Scene;
  dims: { width: number; length: number; height: number };
  atmo: { bg: number; primary: number; accent: number; sky: number };
  textures: THREE.Texture[];
  animated: AnimatedItem[];
  colliders: Collider[];
  interactables: THREE.Object3D[];
  addRect(minX: number, maxX: number, minZ: number, maxZ: number): void;
  fromObject(obj: THREE.Object3D, pad?: number): void;
}

export function buildHospital(ctx: BuildCtx, ctfs: CTFData[], ctfGroups: THREE.Group[]): void {
  const { scene, dims, atmo, textures, animated, addRect, fromObject } = ctx;
  const RW = dims.width, RL = dims.length, RH = dims.height;

  const skyTex = eSkyTexture('hospital', textures);
  const windows: { mx: number; w: number; h: number; y: number }[] = [
    { mx: -5.8, w: 3.0, h: 1.6, y: 2.6 },
    { mx: -1.0, w: 3.0, h: 1.6, y: 2.6 },
    { mx: 3.8, w: 3.0, h: 1.6, y: 2.6 },
  ];
  windows.forEach(({ mx, w, h, y }) => {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.24, h + 0.24, 0.06), new THREE.MeshStandardMaterial({ color: 0x122a33, metalness: 0.65, roughness: 0.4 }));
    frame.position.set(mx, y, -RL / 2 + 0.10); scene.add(frame);
    fromObject(frame, 0.02);
    const view = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: skyTex }));
    view.position.set(mx, y, -RL / 2 + 0.14); scene.add(view);
    view.userData.isWindow = true;
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.06, h + 0.06), new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.06 }));
    glow.position.set(mx, y, -RL / 2 + 0.16); scene.add(glow);
  });

  const eastSky = eSkyTexture('hospital', textures);
  const ew = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.5), new THREE.MeshBasicMaterial({ map: eastSky }));
  ew.rotation.y = -Math.PI / 2; ew.position.set(RW / 2 - 0.05, 2.0, -3.8); scene.add(ew);
  const ewFrame = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.66, 2.36), new THREE.MeshStandardMaterial({ color: 0x122a33, metalness: 0.65 }));
  ewFrame.position.set(RW / 2 - 0.06, 2.0, -3.8); scene.add(ewFrame);

  for (let side of [-1, 1] as const) {
    const sx = side * (RW / 2 - 0.28);
    const conduit = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, RL * 0.94, 12), new THREE.MeshStandardMaterial({ color: 0x8a99a8, metalness: 0.62, roughness: 0.42 }));
    conduit.rotation.x = Math.PI / 2; conduit.position.set(sx, RH - 0.38, 0); scene.add(conduit);
    addRect(sx - 0.15, sx + 0.15, -RL / 2 + 0.4, RL / 2 - 0.4);
  }

  const podBase = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.75, 0.70, 20), new THREE.MeshStandardMaterial({ color: 0x0e2733, metalness: 0.88, roughness: 0.22 }));
  podBase.position.set(0, 0.35, -1.2); scene.add(podBase); fromObject(podBase, 0.2);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.18, 1.55, 16, 1, true), new THREE.MeshPhysicalMaterial({ color: 0x7ef3dd, transparent: true, opacity: 0.20, transmission: 0.88, roughness: 0.14, side: THREE.DoubleSide }));
  cap.position.set(0, 1.25, -1.2); scene.add(cap);
  const capRoof = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.18, 0.03, 16), new THREE.MeshStandardMaterial({ color: 0x0d2230, metalness: 0.9 }));
  capRoof.position.set(0, 2.03, -1.2); scene.add(capRoof);
  const bed = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.42, 1.55), new THREE.MeshStandardMaterial({ color: 0xe6f5f3, roughness: 0.6 }));
  bed.position.set(0, 0.85, -1.1); scene.add(bed);
  const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.12, 0.36), new THREE.MeshStandardMaterial({ color: 0xf5fffd }));
  pillow.position.set(0, 1.09, -1.7); scene.add(pillow);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.065, 10, 28), new THREE.MeshBasicMaterial({ color: 0x22d3ee }));
  ring.rotation.x = Math.PI / 2; ring.position.set(0, RH - 0.58, -1.2); scene.add(ring);
  const ringLight = new THREE.PointLight(0x22d3ee, 44, 14, 1.6); ringLight.position.set(0, RH - 0.72, -1.2); scene.add(ringLight);

  const ecgCanvas = document.createElement('canvas'); ecgCanvas.width = 640; ecgCanvas.height = 320;
  const ectx = ecgCanvas.getContext('2d')!;
  const ecgTex = new THREE.CanvasTexture(ecgCanvas); textures.push(ecgTex);
  const ecgPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 1.9), new THREE.MeshBasicMaterial({ map: ecgTex }));
  ecgPlane.position.set(0, 2.35, -RL / 2 + 0.04); scene.add(ecgPlane);

  const redCross = new THREE.Group();
  const crH = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.02), new THREE.MeshBasicMaterial({ color: 0xef2b2b }));
  const crV = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.02), new THREE.MeshBasicMaterial({ color: 0xef2b2b }));
  redCross.add(crH, crV); redCross.position.set(RW / 2 - 0.08, 1.65, -0.8); redCross.rotation.y = -Math.PI / 2; scene.add(redCross);
  const crossLight = new THREE.PointLight(0xef4444, 18, 10, 1.6); crossLight.position.set(RW / 2 - 0.20, 1.65, -0.8); scene.add(crossLight);

  const cart = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.95, 0.52), new THREE.MeshStandardMaterial({ color: 0xdfe8ec, metalness: 0.45, roughness: 0.5 }));
  cart.position.set(-2.85, 0.48, 1.2); scene.add(cart); fromObject(cart, 0.12);
  const cartLight = new THREE.PointLight(0x22d3ee, 10, 8, 1.7); cartLight.position.set(-2.85, 0.95, 1.2); scene.add(cartLight);

  const ivGroup = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.05, 8), new THREE.MeshStandardMaterial({ color: 0x9ab0bd, metalness: 0.7 }));
  pole.position.set(0, 1.02, 0); ivGroup.add(pole);
  const hook = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.04, 0.04), new THREE.MeshStandardMaterial({ color: 0x93a8b8 }));
  hook.position.set(0, 2.06, 0); ivGroup.add(hook);
  const bag = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.32, 0.06), new THREE.MeshPhysicalMaterial({ color: 0x5af0cc, transparent: true, opacity: 0.26, roughness: 0.3 }));
  bag.position.set(-0.16, 1.88, 0); ivGroup.add(bag);
  ivGroup.position.set(1.95, 0, 0.2); scene.add(ivGroup); addRect(1.95 - 0.18, 1.95 + 0.18, 0.2 - 0.18, 0.2 + 0.18);

  const iv2 = ivGroup.clone(); iv2.position.set(-1.75, 0, 0.55); scene.add(iv2); addRect(-1.75 - 0.18, -1.75 + 0.18, 0.55 - 0.18, 0.55 + 0.18);

  const curtainStrips: THREE.Mesh[] = [];
  for (let i = 0; i < 6; i++) {
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 2.25), new THREE.MeshPhysicalMaterial({ color: 0x99f6e4, transparent: true, opacity: 0.11, side: THREE.DoubleSide, roughness: 0.4 }));
    strip.position.set(-1.55 + i * 0.58, 1.55, RL / 2 - 3.2);
    strip.rotation.y = (Math.random() - 0.5) * 0.18; scene.add(strip); curtainStrips.push(strip);
  }

  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.10, 10, 10), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  beacon.position.set(-RW / 2 + 0.22, RH - 0.18, 2.8); scene.add(beacon);
  const beaconLight = new THREE.PointLight(0xef4444, 26, 18, 1.35); beaconLight.position.copy(beacon.position); scene.add(beaconLight);

  const dustGeo = new THREE.BufferGeometry();
  const nP = 90, posArr = new Float32Array(nP * 3), velY = new Float32Array(nP);
  for (let i = 0; i < nP; i++) {
    posArr[i * 3 + 0] = (Math.random() - 0.5) * RW * 0.92;
    posArr[i * 3 + 1] = 0.15 + Math.random() * (RH - 0.5);
    posArr[i * 3 + 2] = (Math.random() - 0.5) * RL * 0.90;
    velY[i] = 0.12 + Math.random() * 0.35;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0x7ef3dd, size: 0.04, transparent: true, opacity: 0.55 }));
  scene.add(dust);

  const ctfGlow: THREE.PointLight[] = [];
  ctfs.forEach((_c, idx) => {
    const g = ctfGroups[idx];
    if (!g) return;
    const pl = new THREE.PointLight(0xfacc15, 14, 6.5, 1.6);
    pl.position.set(g.position.x, 1.10, g.position.z); scene.add(pl); ctfGlow.push(pl);
    const halo = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.56, 20), new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.22, side: THREE.DoubleSide }));
    halo.rotation.x = -Math.PI / 2; halo.position.set(g.position.x, 0.06, g.position.z); scene.add(halo);
  });

  animated.push({
    update(time) {
      ring.rotation.z = time * 0.55;
      const glitch = Math.random() > 0.965;
      ectx.fillStyle = 'rgba(6,18,22,0.92)'; ectx.fillRect(0, 0, 640, 320);
      ectx.fillStyle = 'rgba(34,211,238,0.14)'; ectx.fillRect(8, 8, 624, 304);
      ectx.strokeStyle = glitch ? '#ef4444' : '#10b981'; ectx.lineWidth = 4; ectx.beginPath();
      const off = (time * 185) % 640;
      for (let x = 0; x < 640; x += 4) {
        const rel = (x + off) % 640; let y = 160;
        if (glitch) y = 160 + (Math.random() - 0.5) * 110;
        else if (rel > 230 && rel < 272) y = 160 - Math.sin((rel - 230) / 42 * Math.PI) * 88;
        else if (rel >= 272 && rel < 304) y = 160 + Math.sin((rel - 272) / 32 * Math.PI) * 52;
        if (x === 0) ectx.moveTo(x, y); else ectx.lineTo(x, y);
      }
      ectx.stroke();
      ectx.fillStyle = glitch ? '#fecaca' : '#7ef3dd';
      ectx.font = 'bold 20px JetBrains Mono'; ectx.textAlign = 'left';
      ectx.fillText(glitch ? 'SIGNAL LOST // PURGE SPIKE' : 'BPM  ~ 74   TRIAGE DESYNC 38%', 22, 46);
      ectx.fillStyle = 'rgba(255,255,255,0.42)'; ectx.font = '12px JetBrains Mono';
      ectx.fillText('LEAD II  •  AMPL ×2  •  SPEED 25 mm/s', 22, 72);
      ecgTex.needsUpdate = true;
      ringLight.intensity = Math.random() > 0.055 ? 44 : 11;
      beaconLight.intensity = 18 + Math.sin(time * 4.8) * 9;
      beacon.scale.setScalar(1 + Math.sin(time * 4.8) * 0.18);
      curtainStrips.forEach((s, idx) => { s.rotation.y = Math.sin(time * 0.95 + idx * 0.9) * 0.15; });
      const pos = (dustGeo.attributes.position as THREE.BufferAttribute).array as Float32Array;
      for (let i = 0; i < nP; i++) {
        pos[i * 3 + 1] += velY[i] * 0.016 * 0.5;
        pos[i * 3 + 0] += Math.sin(time + i * 0.4) * 0.003;
        if (pos[i * 3 + 1] > RH - 0.10) pos[i * 3 + 1] = 0.18;
      }
      (dustGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      ctfGlow.forEach((pl, i) => {
        const g = ctfGroups[i]; if (!g) return;
        const completed = (ctfs[i] as unknown as { completed: boolean }).completed;
        pl.color.setHex(completed ? 0x10b981 : 0xfacc15);
        pl.intensity = 10 + Math.sin(time * 1.2 + i * 1.8) * 6;
      });
    }
  });
}
