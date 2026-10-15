import type { BuildingId } from '../types/protocol';

export type ContentTab = 'posts' | 'highlights' | 'stories' | 'notes';
export type SocialArtifact = {
  id: string;
  type: ContentTab;
  time: string;
  caption: string;
  visual: string;
  visualDetail: string;
  comments: string[];
  likes: string;
  building: BuildingId;
  tag?: string;
  image?: string;
  imageAlt?: string;
};
export type SocialAccount = {
  handle: string;
  display: string;
  bio: string;
  location: string;
  color: string;
  avatar: string;
  followers: string;
  role: string;
  posts: SocialArtifact[];
};

// Canonical narrative source for the Yellow Zone investigation. All accounts and content are fictional.
export const SOCIAL_ACCOUNTS: SocialAccount[] = [
  {
    handle: 'afterhours_217', display: 'after hours', bio: 'some shifts end. some don’t.', location: 'Hospital // Staff Corridor', color: '#b45309', avatar: 'AH', followers: '217', role: 'Former hospital intake technician', posts: [
      { id: 'ah-p1', type: 'posts', time: 'Cycle 841 · 02:24', caption: 'They told us to clear the intake desk before morning audit. The paper copy is still here. The screen says the ward was empty. The printer says otherwise.', visual: 'INTAKE COPY // H-017', visualDetail: 'A creased intake slip photographed beside a hospital terminal. The printed time is legible; the terminal beside it displays EMPTY.', comments: ['@still_waiting_17: That was the board we were looking at.', '@afterhours_217: Then you saw it change.'], likes: '18', building: 'hospital', tag: 'PAPER ORIGINAL' },
      { id: 'ah-s1', type: 'stories', time: 'Cycle 841 · 02:31', caption: 'A printer running in an empty room. That is all I am saying.', visual: '02:17:06 / JOB ACCEPTED', visualDetail: 'Printer queue slip showing a job accepted at 02:17:06 SZT, before the terminal’s later EMPTY status.', comments: [], likes: '—', building: 'hospital' },
      { id: 'ah-n1', type: 'notes', time: 'Cycle 841 · 03:02', caption: 'paper remembers what the system forgets', visual: 'NOTE // PUBLIC', visualDetail: 'A short public note with no attached image.', comments: ['@softdelete: Paper is not supposed to leave the building.'], likes: '—', building: 'hospital' },
      { id: 'ah-h1', type: 'highlights', time: 'Saved · Cycle 840', caption: 'Old intake training. If a record is corrected, the original stays in the carbon ledger until reconciliation closes.', visual: 'HIGHLIGHT / INTAKE RULES', visualDetail: 'A saved training card showing that paper duplicates persist until the reconciliation job completes.', comments: [], likes: '—', building: 'hospital' }
    ]
  },
  {
    handle: 'still_waiting_17', display: 'still waiting', bio: 'visitor pass expired. memory did not.', location: 'Hospital → Society Transit Stop', color: '#6d28d9', avatar: '17', followers: '117', role: 'Visitor who witnessed the registry change', posts: [
      { id: 'sw-p1', type: 'posts', time: 'Cycle 841 · 02:18', caption: 'The board changed while we were still waiting. Everyone else acted like it had always said EMPTY. I kept the token because the printed line did not match the screen.', visual: 'VISITOR TOKEN / 17', visualDetail: 'A visitor token stamped 02:17, with the destination field partly obscured by a second print layer.', comments: ['@afterhours_217: Keep the token.', '@still_waiting_17: I have it.'], likes: '23', building: 'hospital', tag: 'WITNESS COPY' },
      { id: 'sw-s1', type: 'stories', time: 'Cycle 841 · 02:19', caption: 'I took this because the time on the board was wrong.', visual: '02:17 → 02:19', visualDetail: 'A two-frame story: the first frame shows an occupied marker, the second shows EMPTY. The wall clock advances by two minutes.', comments: [], likes: '—', building: 'hospital' },
      { id: 'sw-h1', type: 'highlights', time: 'Saved · Cycle 841', caption: 'The walk home. Same windows, same people. The residential map said the fourth unit had never been built.', visual: 'HIGHLIGHT / WALK HOME', visualDetail: 'A saved street photograph showing four lit residential windows although the public map marks only three units.', comments: ['@unit404.window: It was built. We lived there.'], likes: '—', building: 'society' }
    ]
  },
  {
    handle: 'null.archive', display: 'NULL ARCHIVE', bio: 'public copies only. source integrity is not guaranteed.', location: 'School // Records Annex', color: '#475569', avatar: 'N/', followers: '006', role: 'Volunteer archivist maintaining public copies', posts: [
      { id: 'na-p1', type: 'posts', time: 'Cycle 841 · 03:11', caption: 'Registry diff: one entry was present in the first export and absent in the second. No deletion author attached. That means the author field is missing from this copy, not that no one acted.', visual: 'DIFF // VERSION 01 → 02', visualDetail: 'Two export rows with matching checksums except the identity and author columns, which are blank only in Version 02.', comments: ['@ward_zero: No author means no action?', '@null.archive: No. It means no author in this copy.'], likes: '6', building: 'school', tag: 'VERSION 02' },
      { id: 'na-h1', type: 'highlights', time: 'Saved · Cycle 840', caption: 'Found the export cover sheet behind the class roster. It is just a field list, but the archive uses the same order on every recovery manifest.', visual: 'EXPORT FIELDS // DATASET_ID → CYCLE → EVENT_TIME → SOURCE_NODE', visualDetail: 'The original export order is DATASET_ID → CYCLE → EVENT_TIME → SOURCE_NODE. The export stores EVENT_TIME as HHMM; seconds remain in the raw timing feed and are not part of the recovery token.', comments: [], likes: '—', building: 'school', tag: 'EXPORT TEMPLATE' },
      { id: 'na-n1', type: 'notes', time: 'Cycle 841 · 03:19', caption: 'compare the copies, not the captions', visual: 'NOTE // PUBLIC', visualDetail: 'A note saved after the archive comparison.', comments: ['@bellwether_204: The old roster has eighteen lines the new one does not.'], likes: '—', building: 'school' },
      { id: 'na-s1', type: 'stories', time: 'Cycle 841 · 03:22', caption: 'The export template is older than the current interface. The schema did not change when the labels did.', visual: 'MANIFEST REV 3 / SCHEMA UNCHANGED', visualDetail: 'A screenshot of a revision panel where the display labels change, but the four export fields remain in the same order.', comments: [], likes: '—', building: 'school' }
    ]
  },
  {
    handle: 'bellwether_204', display: 'bellwether', bio: 'classroom 204. attendance is not the same as presence.', location: 'School // Classroom 2B', color: '#0369a1', avatar: 'BW', followers: '204', role: 'Teacher whose roster was altered', posts: [
      { id: 'bw-p1', type: 'posts', time: 'Cycle 841 · 03:05', caption: 'There were eighteen names on the printed roster at first bell. The tablet refreshed and every one of those lines vanished. The chairs did not move.', visual: 'CLASS 204-B // 18 LINES REMOVED', visualDetail: 'A classroom roster photographed beside eighteen occupied chairs. The digital tablet shows a shorter list.', comments: ['@null.archive: Do you still have the first export?', '@bellwether_204: Not the whole thing. Enough to know it was real.'], likes: '29', building: 'school', tag: 'ROSTER DISCREPANCY' },
      { id: 'bw-h1', type: 'highlights', time: 'Saved · Cycle 839', caption: 'A lesson on civic records: when a field is blank, preserve the blank. Do not replace it with a conclusion.', visual: 'HIGHLIGHT / RECORD ETHICS', visualDetail: 'A classroom slide explaining the difference between missing data and a verified negative result.', comments: [], likes: '—', building: 'school' },
      { id: 'bw-n1', type: 'notes', time: 'Cycle 841 · 03:27', caption: 'eighteen absences. zero empty chairs.', visual: 'NOTE // CLASS 204', visualDetail: 'A handwritten note photographed on the teacher’s desk.', comments: ['@softdelete: Those are not attendance figures anymore.'], likes: '—', building: 'school' }
    ]
  },
  {
    handle: 'glassward', display: 'G / glassward', bio: 'images are not evidence until someone asks what is outside the frame.', location: 'Museum District', color: '#0e7490', avatar: 'GW', followers: '841', role: 'Photographer who retained the original image', posts: [
      { id: 'gw-p1', type: 'posts', time: 'Cycle 841 · 02:41', caption: 'Gallery test shot. They asked me to delete the reflection. I cropped nothing. The public upload is the same photograph with the lower edge removed.', visual: 'FRAME 09 // ORIGINAL', visualDetail: 'Original gallery photograph. Inspect the reflected catalog card and the lower edge of the frame; the public crop omits that strip.', comments: ['@relicframe: This was not in the submitted version.', '@glassward: Exactly.'], likes: '41', building: 'museum', tag: 'ORIGINAL FILE', image: '/evidence/museum-last-light.png', imageAlt: 'Original moody museum gallery photograph with a framed maze-like ruin artwork.' },
      { id: 'gw-h1', type: 'highlights', time: 'Saved · 6 cycles ago', caption: 'A sequence of photographs from the same night. The last frame carries the catalog card, not the wall label.', visual: 'ARCHIVE CARD // DATASET_ID: CONTINUITY · C-841', visualDetail: 'The preserved catalog metadata explicitly labels DATASET_ID as CONTINUITY and identifies C-841 as the cycle tag. The newer public wall label is not the archive identity; use the source card, not the replacement title.', comments: [], likes: '—', building: 'museum', tag: 'CATALOG HISTORY' },
      { id: 'gw-s1', type: 'stories', time: 'Cycle 841 · 02:45', caption: 'Same room. Different record. The wall label was replaced after my first upload.', visual: 'PUBLIC LABEL ≠ CATALOG CARD', visualDetail: 'A split view of the same display: the wall label says Civic Stability Exhibit; the original catalog card reads Continuity Index.', comments: [], likes: '—', building: 'museum' },
      { id: 'gw-n1', type: 'notes', time: 'Cycle 841 · 02:49', caption: 'if you retouch the reflection, you retouch the room', visual: 'NOTE // PUBLIC', visualDetail: 'A short note posted after the gallery image dispute.', comments: ['@relicframe: The catalog copy was not approved for display.'], likes: '—', building: 'museum' }
    ]
  },
  {
    handle: 'relicframe', display: 'relic / frame', bio: 'conservation logs are not supposed to change history.', location: 'Museum // Conservation Lab', color: '#a16207', avatar: 'RF', followers: '089', role: 'Museum conservator with catalog access', posts: [
      { id: 'rf-p1', type: 'posts', time: 'Cycle 841 · 03:36', caption: 'The exhibit title was changed in the public catalog, not in the conservation manifest. I was told those are separate systems. They share a source ID.', visual: 'CATALOG ID // CI-841', visualDetail: 'Conservation manifest with source ID CI-841 and original title CONTINUITY INDEX; the public title field was overwritten.', comments: ['@glassward: The lower edge is still in my original.', '@relicframe: Then the source card survived.'], likes: '12', building: 'museum', tag: 'MANIFEST COPY' },
      { id: 'rf-h1', type: 'highlights', time: 'Saved · Cycle 840', caption: 'Original catalog note: “Index of civic records preserved through reconciliation.” The new description says “decorative map fragment.”', visual: 'HIGHLIGHT / CATALOG REVISION', visualDetail: 'Before-and-after catalog descriptions for the same source ID.', comments: [], likes: '—', building: 'museum' },
      { id: 'rf-n1', type: 'notes', time: 'Cycle 841 · 03:42', caption: 'CI was never an artwork code. It was the archive category.', visual: 'NOTE // CONSERVATION', visualDetail: 'A note clarifying how the museum indexed its catalog records.', comments: ['@null.archive: Category names are often kept after public labels change.'], likes: '—', building: 'museum' }
    ]
  },
  {
    handle: 'splitlap_841', display: 'split lap', bio: 'timing desk // keep the raw feed.', location: 'Sports Complex // Relay Room', color: '#c2410c', avatar: 'SL', followers: '841', role: 'Sports timing technician', posts: [
      { id: 'sl-p1', type: 'posts', time: 'Cycle 841 · 04:01', caption: 'The public scoreboard replay starts two minutes late. The raw timing buffer still has the first reconciliation pulse.', visual: 'RAW EVENT // 02:17:06 · CYCLE 841', visualDetail: 'The raw buffer records the event at 02:17:06; the public replay begins at 02:19:00. Compare this with the School export schema: EVENT_TIME is normalised to HHMM for the recovery signature, so the raw event contributes 0217, not 0219 or the seconds.', comments: ['@ward_zero: Same offset as the intake board.', '@splitlap_841: I did not say that. The buffer did.'], likes: '33', building: 'sports', tag: 'RAW TIMING' },
      { id: 'sl-s1', type: 'stories', time: 'Cycle 841 · 04:05', caption: 'Replay overlay is not the source. Keep the first pulse, not the broadcast start.', visual: '02:17:06 → 02:19:00', visualDetail: 'A short story comparing the raw buffer timestamp to the delayed public replay.', comments: [], likes: '—', building: 'sports' },
      { id: 'sl-h1', type: 'highlights', time: 'Saved · Cycle 841', caption: 'The timing rack stamps every raw buffer with the current cycle before it mirrors the feed.', visual: 'HIGHLIGHT / TIMING RACK', visualDetail: 'A saved maintenance card showing the Cycle field is written at capture, not at replay.', comments: [], likes: '—', building: 'sports' }
    ]
  },
  {
    handle: 'ward_zero', display: 'WARD ZERO', bio: 'if a record has no origin, ask who benefits from its destination.', location: 'Sports Complex // Relay Room', color: '#9f1239', avatar: 'W0', followers: '0', role: 'Anonymous relay operator', posts: [
      { id: 'wz-p1', type: 'posts', time: 'Cycle 841 · 04:12', caption: 'The sequence is intact. The labels are not. Stop sorting by the names they gave you. The raw event happened before the public replay.', visual: 'RELAY / RAW → MIRROR', visualDetail: 'Relay diagram: raw capture flows into reconciliation, then the public mirror receives a delayed copy.', comments: ['@glassward: Is this about the image?', '@ward_zero: It is about what survived it.'], likes: '0', building: 'sports', tag: 'NO PROFILE HISTORY' },
      { id: 'wz-n1', type: 'notes', time: 'Cycle 841 · 04:14', caption: 'the order is in the record, not the story', visual: 'NOTE // PUBLIC', visualDetail: 'A note posted shortly after the relay diagram.', comments: ['@null.archive: The old export header still exists.'], likes: '—', building: 'sports' },
      { id: 'wz-s1', type: 'stories', time: 'Cycle 841 · 04:17', caption: 'Nothing in this buffer says where the records went. It only says the transfer completed.', visual: 'TRANSFER ACK / DESTINATION REDACTED', visualDetail: 'A relay acknowledgement with a destination field redacted from the public mirror.', comments: [], likes: '—', building: 'sports' }
    ]
  },
  {
    handle: 'unit404.window', display: 'window 404', bio: 'fourth window. same light. different map.', location: 'Society // Residential Block', color: '#7e22ce', avatar: '404', followers: '040', role: 'Resident of the unlisted unit', posts: [
      { id: 'u4-p1', type: 'posts', time: 'Cycle 841 · 04:28', caption: 'The building plan stops at Unit 403. There has always been another door. Our deliveries still find it, even when the address field says INVALID.', visual: 'UNIT 404 // DOOR PLATE', visualDetail: 'Photograph of a residential door plate reading 404 beside a utility panel whose live service address reads UNIT404. The public directory beside the lift lists units 401–403 only.', comments: ['@still_waiting_17: I saw the light from the transit stop.', '@unit404.window: We were told not to answer the door.'], likes: '40', building: 'society', tag: 'PHYSICAL ADDRESS' },
      { id: 'u4-h1', type: 'highlights', time: 'Saved · Cycle 840', caption: 'The residents’ board before it was replaced. Eighteen names were on the old printout. The new board has blank space where the list used to be.', visual: 'HIGHLIGHT / RESIDENT BOARD', visualDetail: 'Two photographs of the same notice board. The earlier image shows eighteen resident rows; the later image shows the rows removed.', comments: [], likes: '—', building: 'society' },
      { id: 'u4-s1', type: 'stories', time: 'Cycle 841 · 04:31', caption: 'Someone changed the building map again. The lights did not go out.', visual: 'MAP: 403 UNITS / WINDOWS: 404', visualDetail: 'A short story showing the building map beside the actual row of illuminated windows.', comments: [], likes: '—', building: 'society' },
      { id: 'u4-n1', type: 'notes', time: 'Cycle 841 · 04:34', caption: 'we are not missing. the field is.', visual: 'NOTE // RESIDENTIAL', visualDetail: 'A note from the unlisted unit.', comments: ['@softdelete: Do not post the address again.'], likes: '—', building: 'society' }
    ]
  },
  {
    handle: 'softdelete', display: 'soft delete', bio: 'contractor // records maintenance // not a confession.', location: 'Society // Civic Records Office', color: '#64748b', avatar: 'SD', followers: '018', role: 'Civic records maintenance contractor', posts: [
      { id: 'sd-p1', type: 'posts', time: 'Cycle 841 · 05:02', caption: 'A purge report can say “continuity maintained” when a record is removed from the public registry but retained in a reconciliation ledger. That is how the dashboard stays green.', visual: 'JOB 841-C // CONTINUITY MAINTAINED', visualDetail: 'A maintenance report showing 18 identity rows removed from the public registry and retained in a reconciliation ledger. Its SOURCE_NODE field is masked by the same invalid-address filter used on the public building map.', comments: ['@bellwether_204: So the rows still exist?', '@softdelete: The report says retained. It does not say where.'], likes: '18', building: 'society', tag: 'MAINTENANCE COPY' },
      { id: 'sd-h1', type: 'highlights', time: 'Saved · Cycle 840', caption: 'Routine purge language: “No identity destroyed. Public index normalised.” I used to think that meant the system had backups.', visual: 'HIGHLIGHT / ROUTINE JOBS', visualDetail: 'A saved maintenance glossary showing the phrase used for registry reconciliation jobs.', comments: [], likes: '—', building: 'society' },
      { id: 'sd-n1', type: 'notes', time: 'Cycle 841 · 05:08', caption: 'the green dashboard measures compliance, not people', visual: 'NOTE // PRIVATE COPY LEAKED PUBLIC', visualDetail: 'A short note copied from a maintenance channel.', comments: ['@unit404.window: Then stop calling us a successful cleanup.'], likes: '—', building: 'society' }
    ]
  }
];

export const BUILDING_NAMES: Record<BuildingId, string> = {
  hospital: 'Hospital', school: 'School', museum: 'Museum', sports: 'Sports Complex', society: 'Society'
};

export const RECOVERED_DATASET = {
  title: 'CONTINUITY LEDGER',
  subtitle: 'CYCLE 841 // COMMUNITY REGISTRY EXPORT',
  summary: 'The Continuity Ledger is recovered. The supplied Community Registry export contains 120 resident records and all 20 original columns. Eighteen records were identified by the investigation as removed from the public index; that clue describes the discrepancy, not the total size of this export. The evidence establishes suppression and retention, but not the ultimate fate of the residents.',
  fields: [
    { field: 'DATASET_ID', value: 'CONTINUITY', source: 'Museum catalog history + maintenance report' },
    { field: 'CYCLE', value: '841', source: 'Raw sports timing buffer + archive metadata' },
    { field: 'EVENT_TIME', value: '0217', source: 'Hospital paper intake + raw relay buffer' },
    { field: 'SOURCE_NODE', value: 'UNIT404', source: 'Physical door plate + residential map comparison' }
  ],
};

export const CANONICAL_FLAG = 'FLAG{CONTINUITY_841_0217_UNIT404}';
export const STORAGE_KEYS = {
  saved: 'manu-yellow-investigation-saved-v1',
  solved: 'manu-yellow-investigation-solved-v1'
};
