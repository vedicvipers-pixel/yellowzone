# Final Room & Map Audit

Developer notes for the latest MANU Protocol package.

## Building-to-room assignments

- Hospital (`MED-Y01`) — medical room; The Triage Protocol.
- School (`EDU-Y02`) — classroom room; The Impossible Timetable.
- Museum (`ARC-Y03`) — archive room; The Last Light.
- Sports Complex (`ATH-Y04`) — gym room; Ghost Scoreboard.
- Society (`RES-Y05`) — residential room; The Vanishing Cluster.

Each building has one unique CTF. The map-marker coordinates are aligned to the corresponding SVG building sites.

## Final polish

- The map opens with optional camera, conduit, and fog overlays off to reduce visual noise; each can still be enabled.
- Selecting a building opens the inspection panel as an overlay instead of shrinking the map. Marker hover tooltips do not stack on top of a selected panel, and top-row tooltips open below the node to avoid clipping.
- The 2D room console now uses telemetry appropriate to its building. The Museum uses a warm gold primary accent that matches its map landmark.
- The alternate 2D room view cannot open the recovered dataset until that building's CTF is complete.
- The first-person room HUD no longer rerenders position and heading text several times per second; exit interaction has a little more clearance from the spawn point.
- 3D signage and room dressing remain building-specific, while the central terminal approach stays open.

## Checks completed

- TypeScript project check (`tsc -b`) passed.
- 25 TypeScript/TSX source files parsed with zero syntax errors.
- 60 relative imports resolved to local files.
- Verified five distinct building IDs, room types, building codes, and CTF IDs; all flags match their solution keys.
- Verified map marker coordinates align with the SVG building positions.
- Verified the original Museum PNG exists and that its RGB LSB payload decodes correctly.

## Runtime verification limitation

The production bundle step could not be completed in this Linux audit container because the copied dependency tree contains the Windows Rolldown native binding, not the Linux binding. The TypeScript check did pass. On the Windows development machine, install dependencies in a fresh extraction (`npm install`) and run `npm run build`, then smoke-test each building and the CTF completion transition in the browser.
