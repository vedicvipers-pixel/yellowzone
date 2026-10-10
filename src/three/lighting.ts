import * as THREE from 'three';
import { Atmosphere } from './rooms/kit';

export function applyLighting(scene: THREE.Scene, atmo: Atmosphere, dims: { width: number; length: number; height: number }, disposables: { dispose(): void }[]) {
  const hemi = new THREE.HemisphereLight(atmo.sky, atmo.ground, 1.2);
  scene.add(hemi);

  const amb = new THREE.AmbientLight(0xffffff, 0.42);
  scene.add(amb);

  scene.fog = new THREE.FogExp2(atmo.bg, atmo.fogDensity);

  const mainIntensity = 210;
  const fillIntensity = 52;
  const stripIntensity = 18;

  const main = new THREE.PointLight(atmo.primary, mainIntensity, 42, 1.55);
  main.position.set(0, dims.height - 0.55, 0);
  main.castShadow = true;
  main.shadow.mapSize.set(1024, 1024);
  scene.add(main);

  const fillL = new THREE.PointLight(atmo.accent, fillIntensity, 32, 1.55);
  fillL.position.set(-dims.width * 0.30, dims.height - 0.40, -dims.length * 0.18);
  scene.add(fillL);

  const fillR = new THREE.PointLight(atmo.accent, fillIntensity, 32, 1.55);
  fillR.position.set(dims.width * 0.30, dims.height - 0.40, -dims.length * 0.18);
  scene.add(fillR);

  const back = new THREE.PointLight(atmo.primary, 34, 28, 1.55);
  back.position.set(0, dims.height * 0.62, dims.length * 0.38);
  scene.add(back);

  function addStrip(pos: THREE.Vector3, len: number, rotY: number, w: number) {
    const geo = new THREE.PlaneGeometry(len, w);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(atmo.primary), emissive: new THREE.Color(atmo.primary),
      emissiveIntensity: 0.22, roughness: 0.5, metalness: 0.0, transparent: true, opacity: 0.92,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    mesh.rotation.y = rotY;
    mesh.rotation.z = 0;
    scene.add(mesh);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: atmo.primary }));
    bulb.position.copy(pos);
    scene.add(bulb);
    if ('dispose' in mat) disposables.push(mat as unknown as { dispose(): void });
  }

  const h = dims.height - 0.05;
  addStrip(new THREE.Vector3(0, h, 0), dims.width * 0.72, 0, 0.08);
  for (let k = 0; k < 5; k++) {
    const tt = (k / 4 - 0.5) * (dims.width * 0.58);
    if (Math.abs(tt) < 0.8) continue;
    addStrip(new THREE.Vector3(tt, h - 0.06, 0), dims.length * 0.62, Math.PI / 2, 0.06);
  }

  const emissiveStrip = new THREE.Mesh(
    new THREE.PlaneGeometry(dims.width * 0.65, 0.12),
    new THREE.MeshBasicMaterial({ color: atmo.accent, transparent: true, opacity: 0.22 }),
  );
  emissiveStrip.rotation.x = -Math.PI / 2; emissiveStrip.position.set(0, 0.04, 0); scene.add(emissiveStrip);

  const glowIntensity = { main, fillL, fillR, back, stripIntensity };

  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), new THREE.MeshBasicMaterial({ color: atmo.primary }));
  beacon.position.set(-dims.width / 2 + 0.20, dims.height - 0.22, dims.length / 2 - 0.20);
  scene.add(beacon);

  return { main, hemi, amb, beacon, glowIntensity };
}
