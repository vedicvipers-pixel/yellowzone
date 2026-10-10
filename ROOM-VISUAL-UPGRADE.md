# Room Visual Upgrade

This revision upgrades the shared first-person room scene while preserving the compact layout and two interactive wall screens.

## Visual changes
- Brighter ceiling luminaires and colored architectural light strips.
- Metallic structural ribs and illuminated corner columns.
- Inlaid floor guide lines that preserve a clear central walking route.
- Two themed side-wall telemetry panels per room.
- More distinct room-specific props for Hospital, School, Museum, Sports Complex, and Society.
- Sports Complex now includes a half-court, backboard/hoop/net, scoreboard, equipment pods, ball detail, and arena banners.

## Interaction behavior
The existing CTF terminal, dataset terminal, E-key interaction, click interaction, and exit interaction code paths were retained.

## Validation note
Dependencies are not bundled in this source archive. A TypeScript build could not be run in this environment because `vite/client` types were unavailable without installing dependencies.
