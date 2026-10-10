# MANU Protocol — Yellow Zone Map Redesign

This revision changes the Yellow Zone map only. The building room scenes and CTF content are otherwise preserved.

## Map changes
- Replaced the previous maze illustration with a more legible tactical district map.
- Added distinct district blocks, primary road loops, cross-lanes, compact maze walls, checkpoints, gates, route traces, conduits, surveillance nodes, and a north indicator.
- Added differentiated facility footprints for Hospital, School, Sports Complex, Society, and Museum.
- Kept building selection, hover information, enter-room action, zoom, tactical/isometric toggle, camera layer, infrastructure layer, and optional fog.
- Kept building marker positions sourced from `src/data/protocolData.ts` (`gridPos`) so existing navigation coordinates remain unchanged.
- Fog is off by default to keep routes and buildings readable.

## Run locally
Use Node.js compatible with the project dependencies, then run:

```bash
npm install
npm run dev
```

To run the production build:

```bash
npm run build
```

The `node_modules` folder is intentionally not included in this ZIP. Install dependencies on the target machine so npm selects the correct platform-specific packages.
