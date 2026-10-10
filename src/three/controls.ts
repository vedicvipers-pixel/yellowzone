import * as THREE from 'three';
import { CTFData } from '../types/protocol';
import { Collider } from './rooms/kit';
import { sound } from '../utils/sound';

export interface PlayerInput {
  keys: { forward: boolean; backward: boolean; left: boolean; right: boolean; sprint: boolean };
  isMouseDown: boolean;
  prevMouseX: number; prevMouseY: number;
  cameraYaw: number; cameraPitch: number;
  playerPos: THREE.Vector3;
  velocity: THREE.Vector3;
  headBobTimer: number; stepDistance: number;
}

export interface InteractTarget { type: 'ctf' | 'exit'; ctf?: CTFData; message: string }

function shortestAngle(a: number): number {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

export interface ControlsCallbacks {
  onCompass(x: number, z: number, headingDeg: number, sprinting: boolean): void;
  onPromptChange(p: InteractTarget | null): void;
}

export class ControlsManager {
  state: PlayerInput;
  autoFaceYaw: number | null = null;
  guideTarget: THREE.Vector3 | null = null;
  private raycaster = new THREE.Raycaster();
  private interactables: THREE.Object3D[] = [];
  private ctfMap = new Map<THREE.Object3D, CTFData>();
  private exitObj: THREE.Object3D | null = null;
  private disposers: (() => void)[] = [];

  constructor(
    private camera: THREE.PerspectiveCamera,
    private renderer: THREE.WebGLRenderer,
    private colliders: Collider[],
    private dims: { width: number; length: number },
    private cbs: ControlsCallbacks,
  ) {
    this.state = {
      keys: { forward: false, backward: false, left: false, right: false, sprint: false },
      isMouseDown: false, prevMouseX: 0, prevMouseY: 0,
      cameraYaw: 0, cameraPitch: 0,
      playerPos: new THREE.Vector3(0, 1.7, dims.length / 2 - 2.2),
      velocity: new THREE.Vector3(), headBobTimer: 0, stepDistance: 0,
    };
  }

  setInteractables(objs: THREE.Object3D[], ctfMap: Map<THREE.Object3D, CTFData>, exitObj: THREE.Object3D | null) {
    this.interactables = objs; this.ctfMap = ctfMap; this.exitObj = exitObj;
  }

  attach(canvas: HTMLCanvasElement): () => void {
    const kd = (e: KeyboardEvent) => {
      const k = this.state.keys;
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': k.forward = true; break;
        case 'KeyS': case 'ArrowDown': k.backward = true; break;
        case 'KeyA': case 'ArrowLeft': k.left = true; break;
        case 'KeyD': case 'ArrowRight': k.right = true; break;
        case 'ShiftLeft': case 'ShiftRight': k.sprint = true; break;
        case 'KeyE': this.tryInteract(); break;
      }
    };
    const ku = (e: KeyboardEvent) => {
      const k = this.state.keys;
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': k.forward = false; break;
        case 'KeyS': case 'ArrowDown': k.backward = false; break;
        case 'KeyA': case 'ArrowLeft': k.left = false; break;
        case 'KeyD': case 'ArrowRight': k.right = false; break;
        case 'ShiftLeft': case 'ShiftRight': k.sprint = false; break;
      }
    };
    const md = (e: MouseEvent) => {
      this.state.isMouseDown = true;
      this.state.prevMouseX = e.clientX; this.state.prevMouseY = e.clientY;
    };
    const mu = () => { this.state.isMouseDown = false; };
    const mm = (e: MouseEvent) => {
      const st = this.state;
      if (document.pointerLockElement === canvas) {
        st.cameraYaw -= e.movementX * 0.0021;
        st.cameraPitch -= e.movementY * 0.0021;
      } else if (st.isMouseDown) {
        const dx = e.clientX - st.prevMouseX, dy = e.clientY - st.prevMouseY;
        st.cameraYaw -= dx * 0.0032; st.cameraPitch -= dy * 0.0032;
        st.prevMouseX = e.clientX; st.prevMouseY = e.clientY;
      }
      st.cameraPitch = Math.max(-1.35, Math.min(1.35, st.cameraPitch));
      this.autoFaceYaw = null;
    };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    window.addEventListener('mousemove', mm);
    window.addEventListener('mouseup', mu);
    canvas.addEventListener('mousedown', md);
    const det = () => { this.disposers.forEach((d) => d()); };
    this.disposers.push(det);
    return () => {
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('mouseup', mu);
      canvas.removeEventListener('mousedown', md);
    };
  }

  onPrompt: InteractTarget | null = null;
  firePrompt: ((p: InteractTarget) => void) | null = null;
  fireExit: (() => void) | null = null;

  tryInteract() {
    if (this.onPrompt) {
      sound.playClick();
      if (this.onPrompt.type === 'ctf' && this.onPrompt.ctf && this.firePrompt) this.firePrompt(this.onPrompt);
      else if (this.onPrompt.type === 'exit' && this.fireExit) this.fireExit();
    }
  }

  update(delta: number): void {
    const st = this.state;
    if (this.autoFaceYaw !== null) {
      const d = shortestAngle(this.autoFaceYaw - st.cameraYaw);
      st.cameraYaw += d * Math.min(1, delta * 6);
      if (Math.abs(d) < 0.02) this.autoFaceYaw = null;
    }
    this.camera.quaternion.setFromEuler(new THREE.Euler(st.cameraPitch, st.cameraYaw, 0, 'YXZ'));
    const fwd = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), st.cameraYaw);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), st.cameraYaw);
    const input = new THREE.Vector3();
    if (st.keys.forward) input.add(fwd);
    if (st.keys.backward) input.sub(fwd);
    if (st.keys.right) input.add(right);
    if (st.keys.left) input.sub(right);
    const moving = input.lengthSq() > 0;
    const mult = st.keys.sprint ? 1.6 : 1.0;
    const maxSpeed = 6.0 * mult;
    if (moving) { input.normalize(); st.velocity.x += input.x * 42 * delta; st.velocity.z += input.z * 42 * delta; }
    const sp = Math.hypot(st.velocity.x, st.velocity.z);
    if (sp > maxSpeed) { st.velocity.x = (st.velocity.x / sp) * maxSpeed; st.velocity.z = (st.velocity.z / sp) * maxSpeed; }
    st.velocity.x -= st.velocity.x * 11 * delta;
    st.velocity.z -= st.velocity.z * 11 * delta;
    this.moveAxis('x', st.velocity.x * delta);
    this.moveAxis('z', st.velocity.z * delta);
    const margin = 0.85, r = 0.42;
    const minX = -this.dims.width / 2 + margin + r, maxX = this.dims.width / 2 - margin - r;
    const minZ = -this.dims.length / 2 + margin + r, maxZ = this.dims.length / 2 - margin - r;
    if (st.playerPos.x < minX) { st.playerPos.x = minX; st.velocity.x = 0; }
    if (st.playerPos.x > maxX) { st.playerPos.x = maxX; st.velocity.x = 0; }
    if (st.playerPos.z < minZ) { st.playerPos.z = minZ; st.velocity.z = 0; }
    if (st.playerPos.z > maxZ) { st.playerPos.z = maxZ; st.velocity.z = 0; }
    this.camera.position.set(st.playerPos.x, st.playerPos.y, st.playerPos.z);
    if (moving && sp > 0.6) {
      st.stepDistance += sp * delta;
      if (st.stepDistance > (st.keys.sprint ? 2.1 : 1.6)) { sound.playFootstep(); st.stepDistance = 0; }
    }
    this.updatePrompt();
    const heading = Math.round(((-st.cameraYaw * 180) / Math.PI % 360 + 360) % 360);
    this.cbs.onCompass(Math.round(st.playerPos.x * 10) / 10, Math.round(st.playerPos.z * 10) / 10, heading, st.keys.sprint && moving);
  }

  private moveAxis(axis: 'x' | 'z', amt: number) {
    if (!amt) return;
    const st = this.state, r = 0.42;
    const nx = st.playerPos.x + (axis === 'x' ? amt : 0);
    const nz = st.playerPos.z + (axis === 'z' ? amt : 0);
    for (const c of this.colliders) {
      const cx = Math.max(c.minX, Math.min(nx, c.maxX));
      const cz = Math.max(c.minZ, Math.min(nz, c.maxZ));
      const dx = nx - cx, dz = nz - cz;
      if (dx * dx + dz * dz < r * r) {
        if (axis === 'x') {
          st.playerPos.x = amt > 0 ? c.minX - r - 0.001 : c.maxX + r + 0.001;
          st.velocity.x = 0;
        } else {
          st.playerPos.z = amt > 0 ? c.minZ - r - 0.001 : c.maxZ + r + 0.001;
          st.velocity.z = 0;
        }
        return;
      }
    }
    if (axis === 'x') st.playerPos.x = nx; else st.playerPos.z = nz;
  }

  private updatePrompt() {
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    this.raycaster.far = 3.4;
    let found: InteractTarget | null = null;
    if (this.interactables.length) {
      const hits = this.raycaster.intersectObjects(this.interactables, true);
      if (hits.length && hits[0].distance < 3.4) {
        let o: THREE.Object3D | null = hits[0].object;
        while (o) {
          const c = this.ctfMap.get(o);
          if (c) { found = { type: 'ctf', ctf: c, message: `ACCESS [${c.label} // CTF-${c.slot}]` }; break; }
          if (o === this.exitObj) { found = { type: 'exit', message: 'EXIT AIRLOCK — RETURN TO COMMUNITY MAP' }; break; }
          o = o.parent;
        }
      }
    }
    if (!found && this.exitObj) {
      const ep = new THREE.Vector3(); this.exitObj.getWorldPosition(ep);
      if (this.state.playerPos.distanceTo(ep) < 2.6) found = { type: 'exit', message: 'EXIT AIRLOCK — RETURN TO COMMUNITY MAP' };
    }
    const a = JSON.stringify(found), b = JSON.stringify(this.onPrompt);
    if (a !== b) { this.onPrompt = found; this.cbs.onPromptChange(found); if (found) sound.playHover(); }
  }

  facePoint(p: THREE.Vector3) {
    const st = this.state;
    const dx = p.x - st.playerPos.x, dz = p.z - st.playerPos.z;
    this.autoFaceYaw = Math.atan2(-dx, -dz);
  }
}
