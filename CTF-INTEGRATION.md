# MANU Protocol — CTF integration

## Included investigations

- **Hospital — Medical timeline audit:** correlate triage hold, purge queue, and archive checksum artifacts.
- **School — Attendance ledger audit:** compare enrollment, attendance export, and ration voucher records.
- **Museum — Archive provenance desk:** compare an artifact's claimed age with digital scan metadata and curator notes.
- **Sports Complex — Arena communications analyzer:** correlate the scoreboard event, receiver summary, and maintenance ticket.
- **Society — Theta housing audit:** cross-check the public directory, authenticated door-controller log, and evacuation record.

Each room has one CTF. The challenge modal presents source artifacts, a clue, and four possible conclusions. The player must select an answer and submit it. Incorrect answers display an error and do not award completion or a flag.

On a correct answer, the app marks the building's CTF complete, logs the recovered flag, updates the resident record, and changes the room's single terminal from CTF mode to dataset mode. The dataset screen opens the relevant resident dossier.

## Run locally

1. Extract the ZIP.
2. Run `npm install`.
3. Run `npm run dev`.
4. Visit the local URL shown by Vite.

## Prototype limitation

This is a frontend-only prototype. CTF completion is held in React state and resets on a full page refresh; answer keys and flags are bundled client-side. For a public or competitive deployment, move answer validation and flag issuance to a backend and persist completion server-side.
