import * as THREE from 'three';
import { CTFData } from '../../types/protocol';
import { eSkyTexture, AnimatedItem, Collider } from './kit';
import { BuildCtx } from './hospital';

export function buildSchool(ctx: BuildCtx, ctfs: CTFData[], ctfGroups: THREE.Group[]): void {
  const { scene, dims, textures, animated, fromObject, addRect } = ctx;
  const RW = dims.width, RL = dims.length, RH = dims.height;

  const sky = eSkyTexture('school', textures);
  const winOffs = [-6.0, -2.0, 2.0, 6.0] as const;
  winOffs.forEach((mx) => {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(3.05, 1.75, 0.06), new THREE.MeshStandardMaterial({ color: 0x1a2736, metalness: 0.55, roughness: 0.5 }));
    frame.position.set(mx, 2.65, -RL / 2 + 0.10); scene.add(frame); fromObject(frame, 0.02);
    const view = new THREE.Mesh(new THREE.PlaneGeometry(2.90, 1.60), new THREE.MeshBasicMaterial({ map: sky }));
    view.position.set(mx, 2.65, -RL / 2 + 0.14); scene.add(view);
    const blind = new THREE.Mesh(new THREE.PlaneGeometry(2.90, 0.10), new THREE.MeshStandardMaterial({ color: 0x25324a, transparent: true, opacity: 0.70 }));
    blind.rotation.x = -0.20; blind.position.set(mx, 2.65 + 0.80 - 0.15, -RL / 2 + 0.16); scene.add(blind);
  });
  const sideSky = eSkyTexture('school', textures);
  const eastWin = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.5), new THREE.MeshBasicMaterial({ map: sideSky }));
  eastWin.rotation.y = -Math.PI / 2; eastWin.position.set(RW / 2 - 0.06, 2.0, -2.0); scene.add(eastWin);
  const eFrame = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.66, 2.36), new THREE.MeshStandardMaterial({ color: 0x1a2736 })); eFrame.position.set(RW / 2 - 0.07, 2.0, -2.0); scene.add(eFrame);

  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.02, RH, 16), new THREE.MeshStandardMaterial({ color: 0x172738, metalness: 0.72, roughness: 0.38 }));
  pillar.position.set(0, RH / 2, -1.0); scene.add(pillar);
  addRect(-1.15, 1.15, -1.0 - 0.9, -1.0 + 0.9);

  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.035, 8, 32), new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true }));
  ring1.position.set(0, 2.1, -1.0); scene.add(ring1);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.02, 8, 32), new THREE.MeshBasicMaterial({ color: 0xfbbf24, wireframe: true }));
  ring2.position.set(0, 2.1, -1.0); scene.add(ring2);

  const cube = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.30, 0.30), new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true }));
  scene.add(cube);

  const desks: THREE.Object3D[] = [];
  const deskRows = [{ x: -3.8, z: 2.2 }, { x: -1.65, z: 2.2 }, { x: 1.65, z: 2.2 }, { x: 3.8, z: 2.2 }, { x: -3.8, z: 0.6 }, { x: -1.65, z: 0.6 }, { x: 1.65, z: 0.6 }, { x: 3.8, z: 0.6 }];
  deskRows.forEach((p) => {
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.08, 0.86), new THREE.MeshStandardMaterial({ color: 0x4a3522, roughness: 0.65 }));
    top.position.set(p.x, 0.74, p.z); scene.add(top);
    const leg = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.62, 0.70), new THREE.MeshStandardMaterial({ color: 0x1d2533, metalness: 0.6 }));
    leg.position.set(p.x, 0.31, p.z); scene.add(leg);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.12, 0.62), new THREE.MeshStandardMaterial({ color: 0x1e2a3b, metalness: 0.55 }));
    seat.position.set(p.x, 0.38, p.z + 0.62); scene.add(seat);
    const slate = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.34), new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.16, side: THREE.DoubleSide }));
    slate.rotation.x = -Math.PI / 2; slate.position.set(p.x, 0.79, p.z); scene.add(slate);
    desks.push(top, leg);
    addRect(p.x - 0.78, p.x + 0.78, p.z - 0.43 - 0.62, p.z + 0.43 + 0.62);
  });

  const locker = new THREE.Mesh(new THREE.BoxGeometry(RW * 0.46, 2.05, 0.52), new THREE.MeshStandardMaterial({ color: 0x253145, metalness: 0.78, roughness: 0.35 }));
  locker.position.set(-RW / 2 + 2.35, 1.03, -2.0); scene.add(locker); fromObject(locker, 0.08);
  for (let i = 0; i < 5; i++) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.02, 2.05, 0.54), new THREE.MeshStandardMaterial({ color: 0x101a27, metalness: 0.5 }));
    line.position.set(-RW / 2 + 1.05 + i * 0.60, 1.03, -2.0); scene.add(line);
  }

  const bookshelf = new THREE.Mesh(new THREE.BoxGeometry(0.38, 2.05, 2.60), new THREE.MeshStandardMaterial({ color: 0x281d14, roughness: 0.7 }));
  bookshelf.position.set(RW / 2 - 0.58, 1.03, 2.8); scene.add(bookshelf); fromObject(bookshelf, 0.06);
  for (let s = 0; s < 5; s++) {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.03, 2.60), new THREE.MeshStandardMaterial({ color: 0x3b2a16 }));
    plate.position.set(RW / 2 - 0.58, 0.35 + s * 0.41, 2.8); scene.add(plate);
    const colors = [0x38bdf8, 0xfbbf24, 0xf97316, 0xd946ef, 0x34d399];
    for (let b = 0; b < 4; b++) {
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.28, 0.14), new THREE.MeshStandardMaterial({ color: colors[(s + b) % 5] }));
      book.position.set(RW / 2 - 0.52, 0.50 + s * 0.41, 2.0 + b * 0.18); scene.add(book);
    }
  }

  const clock = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 20), new THREE.MeshStandardMaterial({ color: 0xf3f4f6, metalness: 0.5 }));
  clock.rotation.y = 0; clock.rotation.z = 0; clock.position.set(0, RH - 0.32, -RL / 2 + 0.25); clock.rotation.x = 0; clock.rotation.z = 0;
  clock.rotation.y = 0;
  (clock as THREE.Mesh).geometry.translate(0, 0, 0); // noop, ensures center
  scene.add(clock);
  const clockHand = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.28, 0.01), new THREE.MeshBasicMaterial({ color: 0x0f172a })); clockHand.position.set(0, 0, 0.04); clock.add(clockHand);
  const clockHand2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.20, 0.01), new THREE.MeshBasicMaterial({ color: 0x0f172a })); clockHand2.position.set(0, 0, 0.04); clock.add(clockHand2);

  const boardCanvas = document.createElement('canvas'); boardCanvas.width = 640; boardCanvas.height = 320;
  const bctx = boardCanvas.getContext('2d')!; const boardTex = new THREE.CanvasTexture(boardCanvas); textures.push(boardTex);
  const board = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 2.1), new THREE.MeshBasicMaterial({ map: boardTex }));
  board.position.set(0, 2.90, -RL / 2 + 0.08); scene.add(board);

  animated.push({
    update(time) {
      ring1.rotation.x = time * 0.75; ring1.rotation.y = time * 0.55;
      ring2.rotation.x = -time * 0.60; ring2.rotation.z = time * 0.68;
      cube.position.set(Math.cos(time * 1.3) * 2.1, 2.10 + Math.sin(time * 2.0) * 0.22, -1.0 + Math.sin(time * 1.3) * 2.05);
      cube.rotation.x = time; cube.rotation.y = time * 1.2;
      clockHand.rotation.z = -time * 1.0;
      clockHand2.rotation.z = -time * 0.07;
      bctx.fillStyle = '#062314'; bctx.fillRect(0, 0, 640, 320);
      bctx.fillStyle = 'rgba(56,189,248,0.09)'; bctx.fillRect(10, 10, 620, 300);
      bctx.strokeStyle = 'rgba(56,189,248,0.28)'; bctx.lineWidth = 1.8; bctx.strokeRect(10, 10, 620, 300);
      bctx.fillStyle = '#38bdf8'; bctx.font = 'bold 20px JetBrains Mono'; bctx.textAlign = 'left';
      bctx.fillText('EDU-CORE // CIVIC LOGIC & CURRICULUM', 22, 44);
      bctx.fillStyle = '#f1f5f9'; bctx.font = '14px JetBrains Mono';
      bctx.fillText('[AXIOM-04]  DELTA(SANCTUARY) = NULL(POPULATION)', 22, 98);
      bctx.fillStyle = '#fbbf24'; bctx.fillText('PUPIL REGISTER  84 / 120   [36 MISSING]', 22, 138);
      bctx.fillStyle = '#34d399'; bctx.fillText('FIREWALL STATUS: PURGING SEGMENT 04 …', 22, 178);
      bctx.fillStyle = '#e2e8f0'; bctx.font = '13px JetBrains Mono';
      const cur = 250 + Math.floor(time * 7) % 500;
      bctx.fillText(`CURSOR @ L${cur}  ::  CHECKSUM MISMATCH`, 22, 228);
      bctx.strokeStyle = 'rgba(56,189,248,0.9)'; bctx.beginPath(); bctx.moveTo(22 + ((time * 90) % 540), 258); bctx.lineTo(30 + ((time * 90) % 540), 258); bctx.stroke();
      boardTex.needsUpdate = true;
      ctfs.forEach((_c, i) => {
        const g = ctfGroups[i]; if (!g) return;
        const completed = (ctfs[i] as unknown as { completed: boolean }).completed;
        const halo = (g as unknown as { userData: { halo?: THREE.Mesh } }).userData.halo;
        if (halo) (halo.material as THREE.MeshBasicMaterial).opacity = 0.18 + Math.sin(time * 1.5 + i) * 0.10;
      });
    }
  });
}
