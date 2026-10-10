import * as THREE from 'three';
import { eSkyTexture } from './kit';
import { BuildCtx } from './hospital';

export function buildMuseum(ctx: BuildCtx, _ctfs: unknown, ctfGroups: THREE.Group[]): void {
  const { scene, dims, textures, animated, fromObject, addRect } = ctx;
  const RW = dims.width, RL = dims.length, RH = dims.height;

  const sky = eSkyTexture('museum', textures);
  const windows = [-6.0, -2.0, 2.0, 6.0] as const;
  windows.forEach((mx) => {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(3.05, 1.75, 0.06), new THREE.MeshStandardMaterial({ color: 0x22123a, metalness: 0.55 }));
    frame.position.set(mx, 2.65, -RL / 2 + 0.10); scene.add(frame); fromObject(frame, 0.02);
    const view = new THREE.Mesh(new THREE.PlaneGeometry(2.90, 1.60), new THREE.MeshBasicMaterial({ map: sky }));
    view.position.set(mx, 2.65, -RL / 2 + 0.14); scene.add(view);
  });
  const glassRoof = new THREE.Mesh(new THREE.PlaneGeometry(RW * 0.54, RL * 0.44), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.11, transmission: 0.92, roughness: 0.14 }));
  glassRoof.rotation.x = -Math.PI / 2; glassRoof.position.set(0, RH - 0.10, -2.4); scene.add(glassRoof);
  const roofFrameX: number[] = [-RW * 0.18, RW * 0.18];
  roofFrameX.forEach((x) => {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, RL * 0.44), new THREE.MeshStandardMaterial({ color: 0x1a1730, metalness: 0.72 }));
    beam.position.set(x, RH - 0.10, -2.4); scene.add(beam);
  });
  const roofFrameZ: number[] = [-2.4 - RL * 0.22, -2.4 + RL * 0.22];
  roofFrameZ.forEach((z) => {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(RW * 0.54, 0.14, 0.14), new THREE.MeshStandardMaterial({ color: 0x1a1730, metalness: 0.72 }));
    beam.position.set(0, RH - 0.10, z); scene.add(beam);
  });

  const dais = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.92, 0.60, 22), new THREE.MeshStandardMaterial({ color: 0x1d1332, metalness: 0.92, roughness: 0.16 }));
  dais.position.set(0, 0.30, -1.0); scene.add(dais); fromObject(dais as unknown as THREE.Object3D, 0.10);
  addRect(-1.75, 1.75, -1.0 - 1.75, -1.0 + 1.75);

  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.30, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.17, transmission: 0.92, roughness: 0.12 }));
  dome.position.set(0, 0.60, -1.0); scene.add(dome);

  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 0), new THREE.MeshBasicMaterial({ color: 0xfacc15, wireframe: true }));
  core.position.set(0, 1.30, -1.0); scene.add(core);
  const gyro = new THREE.Mesh(new THREE.TorusGeometry(0.70, 0.03, 8, 22), new THREE.MeshBasicMaterial({ color: 0xd97706 }));
  gyro.position.set(0, 1.30, -1.0); scene.add(gyro);
  const gyro2 = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.02, 8, 22), new THREE.MeshBasicMaterial({ color: 0xa855f7, wireframe: true }));
  gyro2.position.set(0, 1.30, -1.0); gyro2.rotation.x = Math.PI / 2; scene.add(gyro2);

  const laser = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 12, 8), new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.70 }));
  laser.rotation.z = Math.PI / 2; laser.position.set(0, 1.05, -1.0); scene.add(laser);
  const laserLight = new THREE.PointLight(0xef4444, 26, 12, 1.6); laserLight.position.set(0, 1.05, -1.0); scene.add(laserLight);

  const cases = [
    { x: -RW / 2 + 1.75, z: 1.5 }, { x: RW / 2 - 1.75, z: 1.5 },
    { x: -RW / 2 + 1.75, z: -2.2 }, { x: RW / 2 - 1.75, z: -2.2 },
  ];
  cases.forEach((p) => {
    const stand = new THREE.Mesh(new THREE.BoxGeometry(1.10, 0.92, 1.10), new THREE.MeshStandardMaterial({ color: 0x1a102e, metalness: 0.82 }));
    stand.position.set(p.x, 0.46, p.z); scene.add(stand); fromObject(stand, 0.08);
    const vitrine = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.50, 0.86), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.085, transmission: 0.46 }));
    vitrine.position.set(p.x, 1.17, p.z); scene.add(vitrine);
    const artifact = new THREE.Mesh(new THREE.DodecahedronGeometry(0.23), new THREE.MeshBasicMaterial({ color: 0xa855f7, wireframe: true }));
    artifact.position.set(p.x, 1.02, p.z); scene.add(artifact);
    (artifact as unknown as { userData: Record<string, unknown> }).userData.spin = Math.random() * 0.6;
  });

  const paintingCanvas = document.createElement('canvas'); paintingCanvas.width = 256; paintingCanvas.height = 256;
  const pctx = paintingCanvas.getContext('2d')!;
  const paintingTex = new THREE.CanvasTexture(paintingCanvas); textures.push(paintingTex);
  pctx.fillStyle = '#140a26'; pctx.fillRect(0, 0, 256, 256);
  pctx.strokeStyle = 'rgba(250,204,21,0.65)'; pctx.lineWidth = 1.4; pctx.strokeRect(10, 10, 236, 236);
  pctx.strokeStyle = '#facc15'; pctx.lineWidth = 2; pctx.strokeRect(6, 6, 244, 244);
  for (let i = 0; i < 40; i++) { pctx.fillStyle = `rgba(${40 + Math.random() * 215 | 0},${40 + Math.random() * 180 | 0},${120 + Math.random() * 135 | 0},0.12)`; pctx.beginPath(); pctx.arc(64 + Math.random() * 128, 64 + Math.random() * 150, 6 + Math.random() * 32, 0, Math.PI * 2); pctx.fill(); }
  const paint = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.15), new THREE.MeshBasicMaterial({ map: paintingTex }));
  paint.rotation.y = -Math.PI / 2; paint.position.set(RW / 2 - 0.08, 2.05, 1.0); scene.add(paint);
  const paint2 = paint.clone(); paint2.position.set(-RW / 2 + 0.08, 2.05, -1.8); paint2.rotation.y = Math.PI / 2; scene.add(paint2);
  const pLight = new THREE.SpotLight(0xfff6d8, 220, 10, Math.PI / 5, 0.3, 1.4); pLight.position.set(RW / 2 - 1.5, RH - 0.45, 1.0); pLight.target.position.copy(paint.position); scene.add(pLight); scene.add(pLight.target);
  const pLight2 = pLight.clone(); pLight2.position.set(-RW / 2 + 1.5, RH - 0.45, -1.8); pLight2.target.position.set(-RW / 2 + 0.08, 2.05, -1.8); scene.add(pLight2); scene.add(pLight2.target);

  const ropePts = [new THREE.Vector3(-1.70, 0.70, -1.0 - 1.90), new THREE.Vector3(-1.70, 0.70, -1.0 + 1.90)];
  ropePts.forEach((a, idx) => {
    const b = ropePts[1 - idx];
    const postA = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.70, 8), new THREE.MeshStandardMaterial({ color: 0x2a1d0e, metalness: 0.6 }));
    postA.position.set(a.x, 0.35, a.z); scene.add(postA);
  });
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 3.80, 6), new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.8 }));
  rope.rotation.x = Math.PI / 2; rope.position.set(-1.70, 0.62, -1.0); scene.add(rope);
  const ropeR = rope.clone(); ropeR.position.set(1.70, 0.62, -1.0); scene.add(ropeR);

  const dust = new THREE.BufferGeometry(); const n = 100, arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { arr[i * 3] = (Math.random() - 0.5) * RW * 0.90; arr[i * 3 + 1] = 0.12 + Math.random() * (RH - 0.8); arr[i * 3 + 2] = (Math.random() - 0.5) * RL * 0.90; }
  dust.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  scene.add(new THREE.Points(dust, new THREE.PointsMaterial({ color: 0xffffff, size: 0.035, transparent: true, opacity: 0.42 })));

  animated.push({
    update(time) {
      core.rotation.x = time * 1.05; core.rotation.y = time * 1.45;
      gyro.rotation.x = time * 0.85; gyro.rotation.z = -time * 1.06;
      gyro2.rotation.y = time * 0.92;
      laser.position.z = -1.0 + Math.sin(time * 1.55) * 3.80;
      laser.position.y = 1.05 + Math.cos(time * 2.1) * 0.18;
      laserLight.position.z = laser.position.z; laserLight.position.y = laser.position.y;
      core.position.y = 1.30 + Math.sin(time * 0.9) * 0.07;
      const pos = (dust.attributes.position as THREE.BufferAttribute).array as Float32Array;
      for (let i = 0; i < n; i++) { pos[i * 3 + 1] += Math.sin(time * 0.4 + i) * 0.003; pos[i * 3] += Math.cos(time * 0.3 + i * 0.7) * 0.002; }
      (dust.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      ctfGroups.forEach((g) => { if (g) g.rotation.y += 0.0; });
    }
  });
}
