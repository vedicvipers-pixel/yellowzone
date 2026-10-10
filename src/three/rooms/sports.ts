import * as THREE from 'three';
import { eSkyTexture } from './kit';
import { BuildCtx } from './hospital';

export function buildSports(ctx: BuildCtx, _ctfs: unknown, ctfGroups: THREE.Group[]): void {
  const { scene, dims, textures, animated, fromObject, addRect } = ctx;
  const RW = dims.width, RL = dims.length, RH = dims.height;

  const sky = eSkyTexture('sports', textures);
  const winPos = [-7.0, -2.5, 2.0, 7.0];
  winPos.forEach((mx) => {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.8, 0.06), new THREE.MeshStandardMaterial({ color: 0x2e2216, metalness: 0.55 }));
    frame.position.set(mx, 2.75, -RL / 2 + 0.10); scene.add(frame); fromObject(frame, 0.02);
    const view = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 1.7), new THREE.MeshBasicMaterial({ map: sky }));
    view.position.set(mx, 2.75, -RL / 2 + 0.14); scene.add(view);
  });

  const scoreboard = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.8, 0.45), new THREE.MeshStandardMaterial({ color: 0x1c1208, metalness: 0.85, roughness: 0.3 }));
  scoreboard.position.set(0, RH - 1.2, -1.2); scene.add(scoreboard); fromObject(scoreboard, 0.1);
  const sCanvas = document.createElement('canvas'); sCanvas.width = 640; sCanvas.height = 180;
  const sctx = sCanvas.getContext('2d')!; const sTex = new THREE.CanvasTexture(sCanvas); textures.push(sTex);
  const sScreen = new THREE.Mesh(new THREE.PlaneGeometry(4.85, 1.45), new THREE.MeshBasicMaterial({ map: sTex }));
  sScreen.position.set(0, RH - 1.2, -0.95); scene.add(sScreen);

  const lockerBank = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.3, 0.6), new THREE.MeshStandardMaterial({ color: 0x271a0c, metalness: 0.78, roughness: 0.4 }));
  lockerBank.position.set(0, 1.15, RL / 2 - 0.35); scene.add(lockerBank); fromObject(lockerBank, 0.1);
  for (let i = 0; i < 6; i++) {
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.75, 0.62), new THREE.MeshStandardMaterial({ color: 0x2f1f0d, metalness: 0.8 }));
    door.position.set(-2.1 + i * 1.05, 1.15, RL / 2 - 0.66); scene.add(door);
  }

  const conduit = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.09, 8, 32), new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: true }));
  conduit.rotation.x = Math.PI / 2; conduit.position.set(0, 0.07, 0.5); scene.add(conduit);
  const conduitLight = new THREE.PointLight(0xf97316, 38, 10, 1.6); conduitLight.position.set(0, 0.07, 0.5); scene.add(conduitLight);

  const hoopL = new THREE.Group();
  const backboard = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 0.1), new THREE.MeshStandardMaterial({ color: 0x351a08, metalness: 0.6 }));
  backboard.position.set(0, 2.4, 0); hoopL.add(backboard);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.04, 8, 22), new THREE.MeshStandardMaterial({ color: 0xea580c, metalness: 0.9 }));
  rim.rotation.x = Math.PI / 2; rim.position.set(0, 2.0, -0.18); hoopL.add(rim);
  const net = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.42, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.35 }));
  net.rotation.x = Math.PI; net.position.set(0, 1.8, -0.28); hoopL.add(net);
  hoopL.position.set(-RW / 2 + 2.0, 0, -RL / 2 + 2.5); scene.add(hoopL); fromObject(hoopL, 0.4);
  const hoopR = hoopL.clone(); hoopR.position.set(RW / 2 - 2.0, 0, -RL / 2 + 2.5); scene.add(hoopR); fromObject(hoopR, 0.4);

  const bench = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.38, 0.42), new THREE.MeshStandardMaterial({ color: 0x3a2a1c, roughness: 0.7 }));
  bench.position.set(-3.8, 0.19, -2.2); scene.add(bench); addRect(-3.8 - 1.1, -3.8 + 1.1, -2.2 - 0.21, -2.2 + 0.21);
  const bench2 = bench.clone(); bench2.position.set(3.8, 0.19, -2.2); scene.add(bench2); addRect(3.8 - 1.1, 3.8 + 1.1, -2.2 - 0.21, -2.2 + 0.21);

  const bleacher = new THREE.Mesh(new THREE.BoxGeometry(RW * 0.44, 0.85, 2.4), new THREE.MeshStandardMaterial({ color: 0x281e0d, metalness: 0.6 }));
  bleacher.position.set(0, 0.42, -RL / 2 + 1.2); scene.add(bleacher); addRect(-RW * 0.22, RW * 0.22, -RL / 2 + 1.2 - 1.2, -RL / 2 + 1.2 + 1.2);

  const dust = new THREE.BufferGeometry(); const n = 80, arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { arr[i * 3] = (Math.random() - 0.5) * RW * 0.92; arr[i * 3 + 1] = 0.12 + Math.random() * (RH - 0.6); arr[i * 3 + 2] = (Math.random() - 0.5) * RL * 0.92; }
  dust.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  scene.add(new THREE.Points(dust, new THREE.PointsMaterial({ color: 0xffd880, size: 0.035, transparent: true, opacity: 0.45 })));

  animated.push({
    update(time) {
      const pulse = (Math.sin(time * 6.8) + 1) / 2;
      conduit.scale.setScalar(1 + pulse * 0.045);
      conduitLight.intensity = 30 + pulse * 14;
      sctx.fillStyle = '#0a0602'; sctx.fillRect(0, 0, 640, 180);
      sctx.strokeStyle = '#ea580c'; sctx.lineWidth = 2; sctx.strokeRect(2, 2, 636, 176);
      sctx.fillStyle = '#facc15'; sctx.font = 'bold 30px Chakra Petch, sans-serif'; sctx.textAlign = 'left';
      sctx.fillText('PAVILION // ATH-Y04', 20, 52);
      sctx.fillStyle = '#ea580c'; sctx.font = 'bold 22px JetBrains Mono';
      const sec = String(Math.floor((time * 10) % 60)).padStart(2, '0');
      sctx.fillText(`SUB-LEVEL BUS: 12,400 kW [OVERLOAD] :${sec}`, 20, 98);
      sctx.fillStyle = '#facc15'; sctx.font = '14px JetBrains Mono';
      sctx.fillText(`CTF TRACKING  [ 01: LOCKED ]  [ 02: LOCKED ]`, 20, 140);
      sctx.strokeStyle = 'rgba(250,204,21,0.85)'; sctx.lineWidth = 1.4;
      sctx.beginPath(); sctx.moveTo(20 + ((time * 60) % 600), 158); sctx.lineTo(30 + ((time * 60) % 600), 158); sctx.stroke();
      sTex.needsUpdate = true;
      const pos = (dust.attributes.position as THREE.BufferAttribute).array as Float32Array;
      for (let i = 0; i < n; i++) {
        pos[i * 3 + 1] += Math.sin(time * 0.5 + i) * 0.0035;
        pos[i * 3] += Math.cos(time * 0.4 + i * 0.7) * 0.0025;
      }
      (dust.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      ctfGroups.forEach((g) => { if (g) g.rotation.y += 0; });
    }
  });
}