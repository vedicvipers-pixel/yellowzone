import * as THREE from 'three';
import { BuildCtx } from './hospital';
import { CTFData } from '../../types/protocol';
import { buildHospital } from './hospital';
import { buildSchool } from './school';
import { buildMuseum } from './museum';
import { buildSports } from './sports';
import { buildSociety } from './society';

export function buildRoom(ctx: BuildCtx, ctfs: CTFData[], ctfGroups: THREE.Group[]): void {
  switch (ctx.scene.userData.buildingId as string) {
    case 'hospital': buildHospital(ctx, ctfs, ctfGroups); break;
    case 'school': buildSchool(ctx, ctfs, ctfGroups); break;
    case 'museum': buildMuseum(ctx, ctfs, ctfGroups); break;
    case 'sports': buildSports(ctx, ctfs, ctfGroups); break;
    case 'society': buildSociety(ctx, ctfs, ctfGroups); break;
    default: buildHospital(ctx, ctfs, ctfGroups);
  }
}
