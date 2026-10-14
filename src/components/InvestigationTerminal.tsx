import React, { useEffect, useMemo, useState } from 'react';
import {
  X, Search, Bookmark, BookmarkCheck, MessageCircle,
  Grid3X3, CirclePlay, Clock3, StickyNote, Images, Fingerprint, Radio,
  ArrowUpRight, CheckCircle2, FileSearch, ChevronRight,
  MapPin, ScanSearch, TerminalSquare, Copy, Check
} from 'lucide-react';
import type { BuildingData, BuildingId } from '../types/protocol';
import { sound } from '../utils/sound';
import {
  SOCIAL_ACCOUNTS, BUILDING_NAMES, STORAGE_KEYS,
  type ContentTab, type SocialAccount, type SocialArtifact
} from '../data/investigationData';
import { getResolvedTeamId } from '../utils/supabaseSync';

type TerminalTab = ContentTab;
const TABS: { id: TerminalTab; label: string; icon: React.ReactNode }[] = [
  { id: 'posts', label: 'POSTS', icon: <Grid3X3 size={14} /> },
  { id: 'highlights', label: 'HIGHLIGHTS', icon: <Images size={14} /> },
  { id: 'stories', label: 'STORIES', icon: <CirclePlay size={14} /> },
  { id: 'notes', label: 'NOTES', icon: <StickyNote size={14} /> }
];
const ACCOUNT_FOR_BUILDING: Record<BuildingId, string> = {
  hospital: 'afterhours_217',
  school: 'null.archive',
  museum: 'glassward',
  sports: 'splitlap_841',
  society: 'unit404.window',
};
// Each building has one dedicated account. Artifacts are presented through that
// building's local account mirror, so players cannot switch to other accounts.
const ACCOUNT_BY_HANDLE = new Map(SOCIAL_ACCOUNTS.map(account => [account.handle, account]));
const ALL_ARTIFACTS = SOCIAL_ACCOUNTS.flatMap(account => account.posts.map(post => {
  const localAccount = ACCOUNT_BY_HANDLE.get(ACCOUNT_FOR_BUILDING[post.building]);
  return { ...post, account: localAccount ?? account };
}));
const INVESTIGATION_ORDER: { id: BuildingId; title: string; objective: string }[] = [
  { id: 'hospital', title: 'Hospital', objective: 'Find the first record' },
  { id: 'school', title: 'School', objective: 'Identify missing rows' },
  { id: 'museum', title: 'Museum', objective: 'Verify the dataset' },
  { id: 'sports', title: 'Sports Complex', objective: 'Reconstruct the timeline' },
  { id: 'society', title: 'Society', objective: 'Find the source node' },
];

// Player-facing narrative: one continuous incident, with a natural handoff between nodes.
// This is story context, not a solution checklist; the values still have to be inferred from artifacts.
const CHAPTER_STORIES: Record<BuildingId, {
  title: string;
  incident: string;
  context: string;
  incoming: string;
  handoffLabel: string;
  handoff: string;
  target: string;
}> = {
  hospital: {
    title: 'The record that should not exist',
    incident: 'At the end of a night shift, the Hospital registry rewrote an active intake as EMPTY. There is no discharge signature, no transfer order, and no matching closure record. A paper copy and a printer queue survived the rewrite, while staff were told to treat the public screen as the only accepted version.',
    context: 'Your recovery receiver caught the incident because the printer kept a trace after the registry changed. You are not investigating a medical diagnosis; you are tracing how an authentic record became invisible. The paper trail carries a reconciliation footer used by the city’s civic archives.',
    incoming: 'FIRST AUTHENTICATED NODE · A corrupted transmission resolves to the Hospital intake corridor. The sender and destination are still unknown.',
    handoffLabel: 'TRACE CONTINUES TO // 02 SCHOOL',
    handoff: 'The intake footer uses the same export format as the School Records Annex. The next surviving copy may show whether the system removed the source record or only changed the public version.',
    target: 'Establish that the registry and the surviving physical record disagree, then follow the record’s administrative trail.'
  },
  school: {
    title: 'The roster with eighteen empty lines',
    incident: 'At first bell, a teacher’s printed roster contained eighteen entries that vanished when the classroom tablet refreshed. The chairs in a photograph remain occupied, but the public dashboard reports a clean sync and no discrepancy. The archive holds two exports from before and after the refresh; neither copy tells the whole story.',
    context: 'The Hospital trail led here through a reconciliation footer. The school archivist preserved an older export cover sheet because the current interface changes field labels between revisions. Compare the records as records—not as the captions describe them—and notice what stayed structurally unchanged.',
    incoming: 'INBOUND TRACE · The Hospital’s printer footer matches a format used by the civic export archive.',
    handoffLabel: 'TRACE CONTINUES TO // 03 MUSEUM',
    handoff: 'A supporting-item reference in the archive points to a museum catalog entry. The public gallery label was updated, but an older photograph may preserve the original catalog card and its metadata.',
    target: 'Determine what the missing record was associated with and preserve the original export schema for the final reconstruction.'
  },
  museum: {
    title: 'The image with its edge removed',
    incident: 'A gallery image was replaced after closing. The public label now describes an ordinary exhibit, while a photographer insists the uploaded image is the same frame with its lower edge removed. The conservator’s manifest and the photographer’s private original disagree with the public catalog, but each preserves a different part of the provenance trail.',
    context: 'The School archive pointed to this catalog entry as a supporting item. What looks like an argument over an exhibit is actually a record-integrity problem: the image, label, and preservation manifest no longer describe the same object. Treat the original capture and the later public copy as separate versions.',
    incoming: 'INBOUND TRACE · The school export references a catalog item whose public label no longer matches its archived image.',
    handoffLabel: 'TRACE CONTINUES TO // 04 SPORTS COMPLEX',
    handoff: 'The conservation receipt says the gallery capture passed through a timing relay before it reached the public mirror. The Sports Complex keeps raw timing buffers as well as delayed public replays.',
    target: 'Recover the dataset’s original catalog identity and distinguish original metadata from a later public presentation.'
  },
  sports: {
    title: 'The replay that starts too late',
    incident: 'The public scoreboard replay begins after the raw timing buffer has already recorded activity. Maintenance notes describe a normal delay before public release, but a transfer acknowledgement from the same window has its destination field masked. The official replay is internally consistent—yet it does not begin at the beginning.',
    context: 'The Museum preservation receipt led the investigation to this relay. Compare raw capture times with the published replay instead of assuming the public timeline is the source of truth. The transfer acknowledgement is the surviving link between the altered timeline and a physical address elsewhere in the Yellow Zone.',
    incoming: 'INBOUND TRACE · The museum capture was mirrored through this timing system before publication.',
    handoffLabel: 'TRACE CONTINUES TO // 05 SOCIETY',
    handoff: 'The redacted destination follows a residential service-node format. The public housing map may be incomplete; Society’s door plates, resident boards, and maintenance records can confirm whether the address is real.',
    target: 'Reconstruct the event’s original timing and follow the masked destination to its source node.'
  },
  society: {
    title: 'The address removed from the map',
    incident: 'The public housing map ends at Unit 403, but a photograph shows a fourth occupied doorway. A resident’s board once contained eighteen rows that later disappeared. A maintenance record describes the public index as “normalised” while a private reconciliation ledger retained the removed rows. The data may have been hidden from view rather than destroyed.',
    context: 'The Sports transfer acknowledgement points toward this residential register. The missing address, the eighteen vanished rows, the delayed public replay, the altered museum catalog, and the Hospital intake now look like pieces of the same administrative operation. The remaining task is to reconstruct the dataset’s identity and provenance from the surviving evidence.',
    incoming: 'INBOUND TRACE · The Sports transfer receipt points to a residential service node omitted from the public map.',
    handoffLabel: 'FINAL SYNTHESIS // COMMON RECOVERY SIGNATURE',
    handoff: 'This is the final chapter, not a separate puzzle. Reconcile the verified fields across all five buildings, using the original export order preserved by the School archive. Return to the Yellow Zone map to submit the shared recovery signature and open the Continuity Ledger.',
    target: 'Corroborate the hidden source address and assemble one recovery signature from the connected five-building investigation.'
  }
};
const safeReadList = (key: string): string[] => {
  try { const raw = window.localStorage.getItem(key); const parsed = raw ? JSON.parse(raw) : []; return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []; }
  catch { return []; }
};
const safeReadSolved = (): boolean => {
  const teamId = getResolvedTeamId();
  if (!teamId) return false;
  try {
    return window.localStorage.getItem(`yellow_solved_${teamId}`) !== null ||
           window.localStorage.getItem(`${STORAGE_KEYS.solved}_${teamId}`) === 'true';
  } catch {
    return false;
  }
};

interface InvestigationTerminalProps { building: BuildingData; onClose: () => void; }

export const InvestigationTerminal: React.FC<InvestigationTerminalProps> = ({ building, onClose }) => {
  const activeAccount = ACCOUNT_FOR_BUILDING[building.id];
  const [activeTab, setActiveTab] = useState<TerminalTab>('posts');
  const [search, setSearch] = useState('');

  const [savedIds, setSavedIds] = useState<string[]>(() => safeReadList(STORAGE_KEYS.saved));
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [showEvidenceBoard, setShowEvidenceBoard] = useState(false);
  const [solved, setSolved] = useState<boolean>(safeReadSolved);
  const [showBriefing, setShowBriefing] = useState(true);
  const [copiedArtifactId, setCopiedArtifactId] = useState<string | null>(null);
  const [copyErrorArtifactId, setCopyErrorArtifactId] = useState<string | null>(null);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(savedIds)); } catch { /* Storage is optional; investigation still works in-memory. */ }
  }, [savedIds]);
  useEffect(() => {
    const teamId = getResolvedTeamId();
    if (!teamId) return;
    try {
      if (solved) {
        window.localStorage.setItem(`${STORAGE_KEYS.solved}_${teamId}`, 'true');
      } else {
        window.localStorage.removeItem(`${STORAGE_KEYS.solved}_${teamId}`);
      }
    } catch { /* Storage is optional. */ }
  }, [solved]);
  useEffect(() => {
    const syncSolved = () => setSolved(safeReadSolved());
    window.addEventListener('manu-ledger-state-change', syncSolved);
    window.addEventListener('storage', syncSolved);
    return () => {
      window.removeEventListener('manu-ledger-state-change', syncSolved);
      window.removeEventListener('storage', syncSolved);
    };
  }, []);

  const account = ACCOUNT_BY_HANDLE.get(activeAccount) ?? SOCIAL_ACCOUNTS[0];
  const savedItems = ALL_ARTIFACTS.filter(item => savedIds.includes(item.id));
  const sourceItems = showEvidenceBoard
    ? savedItems.filter(item => item.building === building.id)
    : ALL_ARTIFACTS.filter(item => item.building === building.id && item.type === activeTab);
  const visibleItems = sourceItems.filter(item =>
    (!search || `${item.account.handle} ${item.account.display} ${item.caption} ${item.visual} ${item.visualDetail} ${item.comments.join(' ')}`.toLowerCase().includes(search.toLowerCase()))
  );
  const activeCount = useMemo(() => ALL_ARTIFACTS.filter(item => item.building === building.id).length, [building.id]);

  const toggleSave = (id: string) => setSavedIds(previous => previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id]);
  const toggleComments = (id: string) => setExpandedComments(previous => previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id]);
  const chooseAccount = () => { setActiveTab('posts'); setShowEvidenceBoard(false); sound.playClick(); };

  const copyArtifactText = async (item: typeof ALL_ARTIFACTS[number]) => {
    const textToCopy = [
      'MANU PROTOCOL // YELLOW ZONE EVIDENCE',
      `BUILDING: ${BUILDING_NAMES[item.building]}`,
      `ACCOUNT: @${item.account.handle}`,
      `ARCHIVE ID: ${item.id.toUpperCase()}`,
      `TIME: ${item.time}`,
      `TYPE: ${item.type.toUpperCase()}`,
      `ARTIFACT: ${item.visual}`,
      `DETAILS: ${item.visualDetail}`,
      `CAPTION: ${item.caption}`,
      ...(item.comments.length ? [`COMMENTS:\n${item.comments.map(comment => `- ${comment}`).join('\n')}`] : [])
    ].join('\n');
    try {
      let copied = false;
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(textToCopy);
          copied = true;
        } catch {
          // Clipboard permission can be denied; try the local selection fallback.
        }
      }
      if (!copied) {
        const area = document.createElement('textarea');
        area.value = textToCopy;
        area.setAttribute('readonly', '');
        area.setAttribute('aria-hidden', 'true');
        area.style.position = 'fixed';
        area.style.left = '-9999px';
        area.style.top = '0';
        document.body.appendChild(area);
        area.select();
        copied = document.execCommand('copy');
        area.remove();
      }
      if (!copied) throw new Error('Clipboard unavailable');
      setCopiedArtifactId(item.id);
      setCopyErrorArtifactId(null);
    } catch {
      setCopiedArtifactId(null);
      setCopyErrorArtifactId(item.id);
    }
  };

  const renderArtifact = (item: typeof ALL_ARTIFACTS[number]) => <article key={item.id} className="overflow-hidden rounded-xl border border-[#293547] bg-[#0d131c] shadow-lg">
    <div className="flex items-center gap-2.5 px-3 py-3">
      <span style={{ background: `linear-gradient(135deg, ${item.account.color}, #10151e)` }} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-[10px] font-bold text-white">{item.account.avatar}</span>
      <div className="min-w-0 flex-1"><div className="truncate text-xs font-bold text-zinc-100">@{item.account.handle}</div><div className="text-[10px] text-zinc-500">{item.time} · {BUILDING_NAMES[item.building]}</div></div>
      {item.tag && <span className="hidden max-w-32 truncate rounded border border-yellow-500/30 bg-yellow-500/10 px-1.5 py-1 text-[9px] text-yellow-300 sm:inline">{item.tag}</span>}
      <button type="button" onClick={() => void copyArtifactText(item)} aria-label={`Copy evidence ${item.id}`} title={copiedArtifactId === item.id ? 'Evidence copied' : 'Copy all evidence text'} className="flex shrink-0 items-center gap-1 rounded border border-[#344155] bg-[#131c28] px-2 py-1.5 text-[9px] font-bold tracking-wide text-zinc-300 transition hover:border-yellow-500/60 hover:text-yellow-200"><span>{copiedArtifactId === item.id ? <Check size={13} /> : <Copy size={13} />}</span><span className="hidden sm:inline">{copiedArtifactId === item.id ? 'COPIED' : 'COPY EVIDENCE'}</span></button>
    </div>
    {item.image ? <div className="border-y border-[#293547] bg-black"><img src={item.image} alt={item.imageAlt ?? item.visualDetail} className="max-h-[330px] w-full object-contain" /><div className="border-t border-[#293547] bg-[#101722] px-3 py-2 text-[10px] leading-relaxed text-zinc-400">VISUAL EXAMINATION: {item.visualDetail}</div></div> : <div className="relative flex min-h-[170px] items-center justify-center overflow-hidden border-y border-[#293547] bg-[radial-gradient(ellipse_at_50%_30%,rgba(67,87,111,0.42),rgba(9,14,22,0.95)_72%)] px-5 py-8 sm:min-h-[210px]"><div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.18) 1px, transparent 1px)', backgroundSize: '28px 28px' }} /><div className="relative max-w-xl text-center"><div className="mb-3 flex items-center justify-center gap-2 text-[9px] tracking-[0.3em] text-zinc-500"><ScanSearch size={12} /> SOURCE ARTIFACT // {item.type.toUpperCase()}</div><div className="break-words font-mono text-lg font-bold tracking-[0.12em] text-zinc-200 drop-shadow-[0_0_12px_rgba(148,163,184,0.3)] sm:text-2xl">{item.visual}</div><div className="mt-3 text-[10px] leading-relaxed text-zinc-400">{item.visualDetail}</div><div className="mt-3 text-[9px] tracking-widest text-zinc-600">SZT · CYCLE 841 · MIRROR COPY</div></div></div>}
    <div className="p-3 sm:p-4"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><button aria-label="Toggle comments" onClick={() => toggleComments(item.id)} className={`text-zinc-400 hover:text-cyan-300 ${expandedComments.includes(item.id) ? 'text-cyan-300' : ''}`}><MessageCircle size={19} /></button><button aria-label="Save evidence" onClick={() => toggleSave(item.id)} className={savedIds.includes(item.id) ? 'text-emerald-300' : 'text-zinc-400 hover:text-emerald-300'}>{savedIds.includes(item.id) ? <BookmarkCheck size={19} /> : <Bookmark size={19} />}</button></div><span className="text-[10px] text-zinc-500">{item.likes} interactions</span></div><p className="mt-3 select-text cursor-text text-xs leading-relaxed text-zinc-200"><b className="mr-2 text-zinc-100">@{item.account.handle}</b>{item.caption}</p>{copyErrorArtifactId === item.id && <p role="status" className="mt-2 text-[10px] text-rose-300">Copy failed in this browser. Select the evidence text directly, or allow clipboard access.</p>}{item.comments.length > 0 && <button onClick={() => toggleComments(item.id)} className="mt-2 text-[10px] text-zinc-500 hover:text-zinc-300">{expandedComments.includes(item.id) ? 'Hide comments' : `View ${item.comments.length} archived comments`}</button>}{expandedComments.includes(item.id) && <div className="mt-2 space-y-2 border-l border-[#344155] pl-3">{item.comments.map((comment, i) => <p key={i} className="text-[11px] leading-relaxed text-zinc-400">{comment}</p>)}</div>}<div className="mt-3 flex items-center justify-between border-t border-[#202b3a] pt-2 text-[9px] text-zinc-600"><span>ARCHIVE ID: {item.id.toUpperCase()}</span><span className="flex items-center gap-1"><Clock3 size={11} /> {item.time}</span></div></div>
  </article>;

  return <div role="dialog" aria-modal="true" aria-label="MANU social trace investigation terminal" className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-2 font-mono-code backdrop-blur-md sm:p-4">
    <div className="relative flex h-[min(920px,96vh)] w-full max-w-7xl flex-col overflow-hidden rounded-xl border border-yellow-500/40 bg-[#080c12] shadow-[0_0_70px_rgba(250,204,21,0.10)]">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#263242] bg-[#111823] px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-yellow-500/40 bg-yellow-500/10 text-yellow-300"><Radio size={18} /></div><div className="min-w-0"><div className="text-[10px] font-bold tracking-[0.22em] text-yellow-400">MANU // SOCIAL TRACE INTERCEPT</div><div className="truncate text-sm font-bold text-zinc-100">YELLOW ZONE NETWORK <span className="font-normal text-zinc-500">/ {building.name.toUpperCase()} NODE</span></div></div></div>
        <div className="flex shrink-0 items-center gap-2"><button onClick={() => { setShowEvidenceBoard(v => !v); setActiveTab('posts'); sound.playClick(); }} className={`hidden items-center gap-2 rounded border px-3 py-2 text-[10px] font-bold tracking-wider sm:flex ${showEvidenceBoard ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300' : 'border-[#344155] bg-[#151d29] text-zinc-300 hover:border-yellow-500/50'}`}><Fingerprint size={14} /> EVIDENCE BOARD <span>({savedIds.length})</span></button>{solved && <span className="hidden items-center gap-1 rounded border border-emerald-500/40 bg-emerald-950/30 px-2 py-1 text-[9px] text-emerald-300 sm:flex"><CheckCircle2 size={12} /> LEDGER RECOVERED</span>}<button aria-label="Close terminal" onClick={onClose} className="rounded p-2 text-zinc-400 hover:bg-white/10 hover:text-white"><X size={18} /></button></div>
      </div>
      <section aria-label="Recommended investigation order" className="shrink-0 border-b border-[#303342] bg-[#0b1017] px-2 py-2 sm:px-4">
        <div className="mb-1.5 flex items-center justify-between gap-2"><span className="text-[9px] font-bold tracking-[0.18em] text-yellow-300 sm:text-[10px]">INVESTIGATION ORDER // 01–05</span><span className="text-[9px] text-zinc-500">Follow the route in numbered order</span></div>
        <div className="grid grid-cols-5 gap-1.5">{INVESTIGATION_ORDER.map((step, index) => { const active = building.id === step.id; return <div key={step.id} aria-current={active ? 'step' : undefined} className={`min-w-0 rounded border px-1.5 py-2 sm:px-2 ${active ? 'border-yellow-400/70 bg-yellow-500/10' : 'border-[#263242] bg-[#101722]'}`}><div className="flex items-center gap-1.5"><span className={`grid h-5 w-5 shrink-0 place-items-center rounded text-[9px] font-black ${active ? 'bg-yellow-400 text-black' : 'bg-[#273244] text-zinc-300'}`}>{index + 1}</span><span className={`truncate text-[8px] font-bold sm:text-[10px] ${active ? 'text-yellow-200' : 'text-zinc-300'}`}>{step.title}</span></div><div className="mt-1 hidden truncate text-[9px] text-zinc-500 sm:block">{step.objective}</div></div>; })}</div>
      </section>
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[230px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden min-h-0 flex-col border-r border-[#222e3d] bg-[#0c1119] md:flex">
          <div className="border-b border-[#222e3d] p-3"><div className="mb-2 text-[10px] tracking-widest text-zinc-500">BUILDING ACCOUNT // 1 OF 1</div><div className="relative"><Search size={14} className="absolute left-3 top-2.5 text-zinc-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search accounts / evidence" className="w-full rounded border border-[#303c4d] bg-[#080c12] py-2 pl-8 pr-2 text-[11px] text-zinc-200 outline-none focus:border-yellow-500/60" /></div></div>
          <div className="flex-1 overflow-y-auto p-3"><div className="rounded-lg border border-yellow-500/35 bg-yellow-500/5 p-3"><div className="flex items-center gap-2"><span style={{ background: `linear-gradient(135deg, ${account.color}, #10151e)` }} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-[10px] font-bold text-white">{account.avatar}</span><div className="min-w-0"><div className="truncate text-[11px] font-bold text-zinc-100">@{account.handle}</div><div className="text-[10px] text-zinc-500">{account.display}</div></div></div><p className="mt-3 text-[10px] leading-relaxed text-zinc-400">This building has one local account. Other building accounts are unavailable from this terminal.</p></div><button onClick={() => { setShowEvidenceBoard(v => !v); setActiveTab('posts'); }} className="mt-3 flex w-full items-center justify-between rounded border border-[#303c4d] bg-[#141b26] p-2 text-[10px] font-bold text-emerald-300">Evidence board <span>{savedItems.length} saved here</span></button></div>
        </aside>
        <main className="min-h-0 overflow-y-auto bg-[radial-gradient(ellipse_at_top,rgba(36,49,68,0.22),transparent_55%)]">
          {showBriefing && !solved && !showEvidenceBoard && <section className="mx-auto mt-3 max-w-4xl px-3 sm:px-6"><div className="rounded-lg border border-yellow-500/25 bg-yellow-950/10 p-3 sm:p-4"><div className="flex items-start gap-3"><TerminalSquare className="mt-0.5 shrink-0 text-yellow-300" size={18} /><div className="min-w-0 flex-1"><div className="text-[10px] font-bold tracking-[0.18em] text-yellow-300">MISSION BRIEF // YZ-841</div><p className="mt-1 text-xs leading-relaxed text-zinc-300">Sanctuary Zero’s public dashboard reports perfect registry continuity, but your receiver captured a damaged packet hidden inside a routine maintenance broadcast. The packet points to five Yellow Zone nodes and a dataset the public index says was never attached. Reconstruct its chain of custody: compare original records with public copies, and do not mistake a missing row for proof that the underlying record never existed. Every building contributes to the same case.</p><p className="mt-2 text-[10px] leading-relaxed text-zinc-500">The account mirrors are local archived traces. Posts, stories, highlights, notes, and images may disagree because they preserve different versions of the same event.</p></div><button aria-label="Dismiss briefing" onClick={() => setShowBriefing(false)} className="text-zinc-500 hover:text-white"><X size={14} /></button></div></div></section>}
          {!solved && !showEvidenceBoard && <section className="mx-auto mt-3 max-w-4xl px-3 sm:px-6"><div className="overflow-hidden rounded-xl border border-[#344155] bg-[#0e151f]"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#263242] bg-[#141c28] px-3 py-2.5 sm:px-4"><div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded border border-yellow-400/40 bg-yellow-400/10 text-[11px] font-black text-yellow-200">{String(INVESTIGATION_ORDER.findIndex(step => step.id === building.id) + 1).padStart(2, '0')}</span><div><div className="text-[9px] font-bold tracking-[0.2em] text-yellow-300">CHAPTER FILE // {building.name.toUpperCase()}</div><h2 className="mt-0.5 text-sm font-bold text-white">{CHAPTER_STORIES[building.id].title}</h2></div></div><span className="rounded border border-[#344155] px-2 py-1 text-[9px] tracking-widest text-zinc-400">CYCLE 841 · CASE CONTINUITY</span></div><div className="grid gap-0 lg:grid-cols-[minmax(0,1.25fr)_minmax(230px,0.75fr)]"><div className="p-3 sm:p-4"><div className="text-[9px] font-bold tracking-[0.18em] text-zinc-500">INCIDENT REPORT</div><p className="mt-1.5 text-xs leading-relaxed text-zinc-200">{CHAPTER_STORIES[building.id].incident}</p><div className="mt-3 border-l-2 border-cyan-500/50 pl-3"><div className="text-[9px] font-bold tracking-[0.16em] text-cyan-300">WHY THIS NODE MATTERS</div><p className="mt-1 text-[11px] leading-relaxed text-zinc-400">{CHAPTER_STORIES[building.id].context}</p></div></div><div className="border-t border-[#263242] bg-black/15 p-3 sm:p-4 lg:border-l lg:border-t-0"><div className="text-[9px] font-bold tracking-[0.18em] text-zinc-500">TRACE HANDOFF</div><p className="mt-1.5 text-[10px] font-bold leading-relaxed text-yellow-200">{CHAPTER_STORIES[building.id].handoffLabel}</p><p className="mt-1.5 text-[11px] leading-relaxed text-zinc-300">{CHAPTER_STORIES[building.id].handoff}</p><div className="mt-3 border-t border-[#263242] pt-3"><div className="text-[9px] font-bold tracking-[0.16em] text-zinc-500">CHAPTER OBJECTIVE</div><p className="mt-1 text-[10px] leading-relaxed text-zinc-400">{CHAPTER_STORIES[building.id].target}</p></div></div></div></div></section>}
          {showEvidenceBoard ? <div className="mx-auto max-w-4xl p-4 sm:p-7"><div className="mb-5 flex items-start justify-between gap-3"><div><div className="text-[10px] tracking-[0.22em] text-emerald-300">OPERATIVE WORKSPACE</div><h2 className="mt-1 text-xl font-bold text-zinc-100">Evidence Board</h2><p className="mt-1 text-xs text-zinc-500">Saved artifacts persist between building terminals on this browser.</p></div><button onClick={() => setShowEvidenceBoard(false)} className="text-xs text-yellow-300 hover:underline">Back to accounts</button></div>{savedItems.length === 0 ? <div className="rounded-xl border border-dashed border-[#364254] bg-[#101722]/70 p-10 text-center"><Bookmark size={25} className="mx-auto mb-3 text-zinc-600" /><div className="text-sm font-bold text-zinc-300">No evidence saved yet</div><p className="mt-2 text-xs text-zinc-500">Bookmark posts, stories, highlights, or notes while investigating.</p></div> : <div className="grid gap-3 sm:grid-cols-2">{savedItems.map(item => <article key={item.id} className="rounded-lg border border-emerald-900/70 bg-[#0e1718] p-3"><div className="flex items-center justify-between text-[10px] text-emerald-300"><span>@{item.account.handle}</span><button onClick={() => toggleSave(item.id)} className="hover:text-white">REMOVE</button></div><div className="my-2 rounded bg-black/30 p-3 text-center text-xs tracking-widest text-zinc-300">{item.visual}</div><p className="text-xs leading-relaxed text-zinc-200">{item.caption}</p><div className="mt-2 text-[10px] text-zinc-500">{item.time} · {BUILDING_NAMES[item.building]}</div></article>)}</div>}</div>
            : <div className="mx-auto max-w-3xl p-3 sm:p-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2 text-[10px] text-zinc-500"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> BUILDING MIRROR ONLINE <span className="text-zinc-700">/</span> 1 ACCOUNT <span className="text-zinc-700">/</span> {ALL_ARTIFACTS.filter(item => item.building === building.id).length} ARTIFACTS</div><button onClick={() => { setShowEvidenceBoard(true); sound.playClick(); }} className="flex items-center gap-1.5 rounded border border-emerald-900/80 bg-emerald-950/30 px-2.5 py-1.5 text-[10px] font-bold text-emerald-300 hover:bg-emerald-950/60"><BookmarkCheck size={13} /> SAVED ({savedIds.length})</button></div>
              <div className="mb-3 grid grid-cols-1 gap-2 md:hidden"><div className="rounded border border-yellow-500/30 bg-yellow-500/5 px-3 py-2 text-[11px] text-yellow-200">LOCAL ACCOUNT: @{account.handle} · {building.name}</div><div className="relative"><Search size={14} className="absolute left-3 top-3 text-zinc-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search this account’s evidence" className="w-full rounded border border-[#303c4d] bg-[#080c12] py-2.5 pl-8 pr-2 text-xs text-zinc-200 outline-none focus:border-yellow-500/60" /></div></div>
              <section className="mb-4 rounded-xl border border-[#2b3647] bg-[#101722]/90 p-4 sm:p-5"><div className="flex items-start gap-4"><span style={{ background: `linear-gradient(135deg, ${account.color}, #10151e)` }} className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-white/15 text-lg font-bold text-white shadow-lg">{account.avatar}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-base font-bold text-white">{account.display}</h2><span className="text-xs text-zinc-500">@{account.handle}</span><span className="rounded border border-yellow-500/30 bg-yellow-500/10 px-1.5 py-0.5 text-[9px] text-yellow-300">MIRRORED</span></div><p className="mt-2 text-xs leading-relaxed text-zinc-300">{account.bio}</p><div className="mt-2 text-[10px] leading-relaxed text-zinc-500">{account.role}</div><div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-zinc-500"><span><b className="text-zinc-300">{account.followers}</b> followers</span><span><MapPin size={10} className="mr-1 inline" />{account.location}</span><span className="text-emerald-400">SOURCE HASH: {account.handle.slice(0, 3).toUpperCase()}-841</span></div></div></div></section>
              <div className="mb-4 grid grid-cols-4 border-y border-[#263242]">{TABS.map(tab => <button key={tab.id} onClick={() => { setActiveTab(tab.id); setShowEvidenceBoard(false); sound.playClick(); }} className={`flex items-center justify-center gap-1.5 py-3 text-[8px] font-bold tracking-wide sm:text-[10px] ${activeTab === tab.id ? 'border-b-2 border-yellow-400 text-yellow-300' : 'text-zinc-500 hover:text-zinc-200'}`}>{tab.icon}<span>{tab.label}</span></button>)}</div>
              {visibleItems.length === 0 ? <div className="rounded-xl border border-dashed border-[#364254] bg-[#101722]/60 p-8 text-center"><Search size={22} className="mx-auto mb-3 text-zinc-600" /><div className="text-sm font-bold text-zinc-300">No mirrored artifacts in this view</div><p className="mt-2 text-xs text-zinc-500">Change the content tab or search phrase.</p></div> : <div className="space-y-4">{visibleItems.map(item => renderArtifact(item))}</div>}
              <div className="mt-5 flex items-center justify-between border-t border-[#263242] pt-4 text-[10px] text-zinc-600"><span>{showEvidenceBoard ? 'OPERATIVE WORKSPACE' : `END OF MIRRORED CONTENT // ${account.handle.toUpperCase()}`}</span><span className="flex items-center gap-1"><ArrowUpRight size={12} /> {ALL_ARTIFACTS.filter(item => item.building === building.id).length} LOCAL ARTIFACTS IN {building.name.toUpperCase()}</span></div>
            </div>}
        </main>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-[#263242] bg-[#0d131c] px-4 py-2 text-[9px] text-zinc-600"><span>MANU PROTOCOL // SOCIAL GRAPH RECOVERY</span><span className="hidden sm:inline">NO EXTERNAL NETWORK CONNECTION // LOCAL MIRROR</span><span className="text-yellow-500/70">NODE {building.code}</span></div>
    </div>
  </div>;
};
