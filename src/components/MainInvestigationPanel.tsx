import React, { useEffect, useState } from 'react';
import { Activity, ArrowUpRight, CheckCircle2, Database, Download, KeyRound, Radio, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import type { BuildingData, BuildingId } from '../types/protocol';
import { CANONICAL_FLAG, RECOVERED_DATASET, STORAGE_KEYS } from '../data/investigationData';
import { COMMUNITY_COLUMNS, COMMUNITY_RECORDS } from '../data/communityDataset';
import { sound } from '../utils/sound';

type StoryChapter = {
  id: BuildingId;
  number: string;
  name: string;
  title: string;
  account: string;
  description: string;
  image: string;
};

const STORY_CHAPTERS: StoryChapter[] = [
  { id: 'hospital', number: '01', name: 'HOSPITAL', title: 'The record that should not exist', account: '@afterhours_217', description: 'A paper intake survives after the public registry marks the same record EMPTY.', image: '/story/hospital.webp' },
  { id: 'school', number: '02', name: 'SCHOOL', title: 'The roster with eighteen empty lines', account: '@null.archive', description: 'Two exports disagree. The older copy preserves rows the public dashboard no longer shows.', image: '/story/school.webp' },
  { id: 'museum', number: '03', name: 'MUSEUM', title: 'The image with its edge removed', account: '@glassward', description: 'A conservation record and the public catalog describe two different versions of one exhibit.', image: '/story/museum.webp' },
  { id: 'sports', number: '04', name: 'SPORTS COMPLEX', title: 'The replay that starts too late', account: '@splitlap_841', description: 'Raw timing buffers show activity before the official replay begins.', image: '/story/sports.webp' },
  { id: 'society', number: '05', name: 'SOCIETY', title: 'The address removed from the map', account: '@unit404.window', description: 'A real doorway and a retained ledger contradict the public housing index.', image: '/story/society.webp' },
];

const hasRecoveredLedger = (): boolean => {
  const teamId = getResolvedTeamId();
  if (!teamId) return false;
  try {
    return window.localStorage.getItem(`yellow_solved_${teamId}`) !== null ||
           window.localStorage.getItem(`${STORAGE_KEYS.solved}_${teamId}`) === 'true';
  } catch {
    return false;
  }
};

interface MainInvestigationPanelProps {
  buildings: BuildingData[];
  onSelectBuilding: (building: BuildingData) => void;
}

export type FlagResult = 'wrong' | 'correct';
interface MainFlagSubmissionStripProps {
  onFlagResult: (result: FlagResult) => void;
}

const StoryCard: React.FC<{ chapter: StoryChapter; onClick: () => void; compact?: boolean }> = ({ chapter, onClick, compact = false }) => (
  <button
    key={chapter.id}
    type="button"
    onClick={onClick}
    className="group flex w-full items-stretch gap-2 overflow-hidden rounded-md border border-[#283443] bg-[#0c121b] text-left transition hover:border-yellow-500/60 hover:bg-[#111b27]"
  >
    <span className={`relative shrink-0 overflow-hidden ${compact ? 'w-[90px]' : 'w-[96px] xl:w-[108px]'}`}>
      <img src={chapter.image} alt={`${chapter.name.toLowerCase()} investigation scene`} loading="lazy" className="h-full min-h-[68px] w-full object-cover transition duration-300 group-hover:scale-105" />
      <span className="absolute left-1.5 top-1.5 grid h-5 w-6 place-items-center rounded-sm bg-yellow-400 text-[10px] font-black text-black shadow">{chapter.number}</span>
    </span>
    <span className="flex min-w-0 flex-1 flex-col justify-center py-2 pr-2">
      <span className="flex items-center justify-between gap-2 text-[9px] font-bold tracking-[0.12em] text-yellow-300"><span className="truncate">{chapter.name}</span><ArrowUpRight size={12} className="shrink-0 text-zinc-500 group-hover:text-yellow-200" /></span>
      <span className="mt-0.5 text-[10px] font-semibold leading-snug text-zinc-100">{chapter.title}</span>
      <span className="mt-1 line-clamp-2 text-[9px] leading-relaxed text-zinc-400">{chapter.description}</span>
      {!compact && <span className="mt-1 text-[8px] text-zinc-600">LOCAL MIRROR // {chapter.account}</span>}
    </span>
  </button>
);

export const MainInvestigationPanel: React.FC<MainInvestigationPanelProps> = ({ buildings, onSelectBuilding }) => {
  const [mobileStoryOpen, setMobileStoryOpen] = useState(false);

  const storyList = (compact = false) => (
    <div className="space-y-2">
      {STORY_CHAPTERS.map(chapter => {
        const building = buildings.find(item => item.id === chapter.id);
        if (!building) return null;
        return <StoryCard key={chapter.id} chapter={chapter} compact={compact} onClick={() => {
          sound.playClick();
          onSelectBuilding(building);
          setMobileStoryOpen(false);
        }} />;
      })}
    </div>
  );

  return (
    <>
      {/* Desktop story dossier only. Recovery submission now lives in the wide strip below the map. */}
      <aside aria-label="Yellow Zone story and investigation route" className="hidden h-full min-h-0 w-[300px] shrink-0 flex-col overflow-hidden border-l border-[#26313d] bg-[#070b11] font-mono-code xl:w-[330px] lg:flex">
        <div className="shrink-0 border-b border-[#26313d] p-3">
          <div className="mb-2 flex items-center justify-between"><span className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.17em] text-yellow-300"><Radio size={12} /> CASE FILE // YZ-841</span><span className="text-[8px] text-zinc-600">LOCAL MIRROR</span></div>
          <div className="relative h-24 overflow-hidden rounded-md border border-[#31404b]">
            <img src="/story/yellow-zone-briefing.webp" alt="The abandoned Yellow Zone skyline" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b11] via-[#070b11]/15 to-transparent" />
            <div className="absolute bottom-2 left-3 right-3"><div className="text-[8px] font-bold tracking-[0.2em] text-yellow-300">THE MISSING DATASET</div><h2 className="mt-1 text-lg font-black leading-tight text-white">A record that never existed?</h2></div>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-zinc-400">MANU claims the Yellow Zone registry is complete. Yet five local accounts and physical records point to eighteen rows erased from the public index. Follow the route, compare versions, and rebuild the record’s chain of custody.</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <div className="mb-2 flex items-center justify-between"><span className="text-[9px] font-bold tracking-[0.16em] text-yellow-300">THE STORY SO FAR</span><span className="text-[8px] text-zinc-600">ROUTE 01—05</span></div>
          {storyList()}
          <p className="mt-3 flex items-start gap-1.5 text-[8px] leading-relaxed text-zinc-600"><ShieldAlert size={11} className="mt-0.5 shrink-0" /> Evidence is simulated in-world. No external social-media service is contacted.</p>
        </div>
      </aside>

      {/* Mobile/tablet story drawer floats above the map; it no longer contains the recovery form. */}
      <div className="absolute bottom-3 right-3 z-[45] w-[min(340px,calc(100vw-1.5rem))] font-mono-code lg:hidden">
        <div className="overflow-hidden rounded-lg border border-[#34404c] bg-[#080c12]/[0.97] shadow-[0_0_28px_rgba(0,0,0,0.6)] backdrop-blur-md">
          <button type="button" onClick={() => setMobileStoryOpen(value => !value)} className="flex w-full items-center justify-between border-b border-[#25313e] px-3 py-2.5 text-left">
            <span className="flex items-center gap-2"><Activity size={14} className="text-yellow-300" /><span><span className="block text-[9px] font-bold tracking-[0.15em] text-yellow-300">YELLOW ZONE // STORY ROUTE</span><span className="mt-0.5 block text-[9px] text-zinc-400">Five connected traces</span></span></span>
            {mobileStoryOpen ? <ChevronDown size={15} className="text-zinc-400" /> : <ChevronUp size={15} className="text-zinc-400" />}
          </button>
          {mobileStoryOpen && <div className="max-h-[47vh] overflow-y-auto p-2.5">{storyList(true)}</div>}
        </div>
      </div>
    </>
  );
};

import { 
  getResolvedTeamId, 
  fetchYellowZoneProgress, 
  syncYellowZoneToSupabase, 
  getBlueZoneTransitionUrl 
} from '../utils/supabaseSync';

export const MainFlagSubmissionStrip: React.FC<MainFlagSubmissionStripProps> = ({ onFlagResult }) => {
  const [flagInput, setFlagInput] = useState('');
  const [flagMessage, setFlagMessage] = useState('');
  const [solved, setSolved] = useState<boolean>(hasRecoveredLedger);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [rowsOpen, setRowsOpen] = useState(false);
  const [datasetSearch, setDatasetSearch] = useState('');

  // Hydrate solved state from Supabase on mount
  useEffect(() => {
    const teamId = getResolvedTeamId();
    if (!teamId) {
      setSolved(false);
      return;
    }
    fetchYellowZoneProgress(teamId).then(res => {
      if (res.isCompleted) {
        try { window.localStorage.setItem(`${STORAGE_KEYS.solved}_${teamId}`, 'true'); } catch {}
        setSolved(true);
        setSyncStatus('CENTRAL LEDGER VERIFIED // +200 PTS AWARDED · BLUE ZONE UNLOCKED');
        window.dispatchEvent(new Event('manu-ledger-state-change'));
      } else {
        try {
          window.localStorage.removeItem(STORAGE_KEYS.solved);
          window.localStorage.removeItem(`${STORAGE_KEYS.solved}_${teamId}`);
          window.localStorage.removeItem(`yellow_solved_${teamId}`);
          window.localStorage.removeItem('manu_solved');
        } catch {}
        setSolved(false);
        setSyncStatus('');
        window.dispatchEvent(new Event('manu-ledger-state-change'));
      }
    });
  }, []);

  useEffect(() => {
    const syncSolved = () => setSolved(hasRecoveredLedger());
    window.addEventListener('manu-ledger-state-change', syncSolved);
    window.addEventListener('storage', syncSolved);
    return () => {
      window.removeEventListener('manu-ledger-state-change', syncSolved);
      window.removeEventListener('storage', syncSolved);
    };
  }, []);

  const submitFlag = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (flagInput.trim().toUpperCase() === CANONICAL_FLAG) {
      const teamId = getResolvedTeamId();
      setSyncStatus('SYNCING TO CENTRAL LEDGER & VERIFYING +200 PTS...');
      const syncRes = await syncYellowZoneToSupabase(teamId);
      if (syncRes.success) {
        try {
          if (teamId) {
            window.localStorage.setItem(`${STORAGE_KEYS.solved}_${teamId}`, 'true');
            window.localStorage.setItem(`yellow_solved_${teamId}`, 'true');
          }
        } catch {}
        setSolved(true);
        setFlagMessage('CONGRATULATIONS // CONTINUITY LEDGER RECOVERED (+200 PTS)');
        setSyncStatus(`CENTRAL LEDGER SYNCHRONIZED // TOTAL SCORE: ${syncRes.score || 300} PTS · BLUE ZONE UNLOCKED`);
        setRowsOpen(false);
        setDatasetSearch('');
        window.dispatchEvent(new Event('manu-ledger-state-change'));
        onFlagResult('correct');
        sound.playClick();
      } else {
        setFlagMessage(`CENTRAL SYNC REJECTED: ${syncRes.error || 'Solve verification failed'}. Please retry.`);
        setSyncStatus('SYNC FAILED // CENTRAL HUB REJECTED SUBMISSION');
        onFlagResult('wrong');
      }
    } else {
      setFlagMessage('SIGNATURE REJECTED // EVIDENCE DOES NOT RECONCILE');
      onFlagResult('wrong');
    }
  };

  return (
    <section aria-label="Final flag submission" className={`relative z-40 shrink-0 border-t font-mono-code ${solved ? 'border-emerald-400/60 bg-[#071512]' : 'border-yellow-500/45 bg-[#080c12]'}`}>
      <div className="mx-auto grid w-full grid-cols-1 items-center gap-3 px-3 py-3 sm:px-4 lg:grid-cols-[minmax(190px,0.78fr)_minmax(250px,1.05fr)_minmax(320px,1.45fr)] xl:gap-5 xl:px-5">
        <div className="min-w-0">
          {solved ? (
            <>
              <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.15em] text-emerald-300"><CheckCircle2 size={18} /> CONGRATULATIONS</div>
              <div className="mt-1 text-sm font-black text-white">CONTINUITY LEDGER RECOVERED</div>
              <p className="mt-1 text-[9px] leading-relaxed text-emerald-100/70">Community Registry export recovered: 120 resident records × 20 original fields.</p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.15em] text-yellow-300"><KeyRound size={18} /> FINAL RECOVERY SIGNATURE</div>
              <div className="mt-1 text-[11px] font-bold text-white">One shared flag. Five connected traces.</div>
              <p className="mt-1 text-[9px] leading-relaxed text-zinc-400">Investigate the buildings, then submit the completed key here on the main map.</p>
              <code className="mt-1 block select-text break-all text-[9px] text-cyan-200/80">FLAG{'{'}DATASET_ID_CYCLE_EVENT_TIME_SOURCE_NODE{'}'}</code>
            </>
          )}
        </div>

        {solved ? (
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {RECOVERED_DATASET.fields.map(field => <div key={field.field} className="min-w-0 rounded border border-emerald-500/20 bg-emerald-950/20 px-2 py-1.5"><div className="text-[8px] tracking-wider text-emerald-200/60">{field.field}</div><div className="mt-0.5 break-words font-mono text-[11px] font-bold text-emerald-100">{field.value}</div></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5 xl:grid-cols-4">
            <div className="rounded border border-[#253440] bg-black/20 px-2 py-1.5"><div className="text-[8px] font-bold tracking-wide text-yellow-200">DATASET_ID</div><div className="mt-0.5 text-[8px] leading-relaxed text-zinc-500">Museum · source catalog card</div></div>
            <div className="rounded border border-[#253440] bg-black/20 px-2 py-1.5"><div className="text-[8px] font-bold tracking-wide text-yellow-200">CYCLE</div><div className="mt-0.5 text-[8px] leading-relaxed text-zinc-500">Museum + Sports raw buffer</div></div>
            <div className="rounded border border-[#253440] bg-black/20 px-2 py-1.5"><div className="text-[8px] font-bold tracking-wide text-yellow-200">EVENT_TIME</div><div className="mt-0.5 text-[8px] leading-relaxed text-zinc-500">Hospital + Sports · HHMM</div></div>
            <div className="rounded border border-[#253440] bg-black/20 px-2 py-1.5"><div className="text-[8px] font-bold tracking-wide text-yellow-200">SOURCE_NODE</div><div className="mt-0.5 text-[8px] leading-relaxed text-zinc-500">Sports transfer + Society</div></div>
          </div>
        )}

        {solved ? (
          <div className="min-w-0">
            <p className="mb-2 text-[9px] leading-relaxed text-emerald-100/75">{RECOVERED_DATASET.summary}</p>
            {syncStatus && (
              <div className="mb-2 rounded border border-emerald-500/40 bg-emerald-950/40 px-2 py-1 text-[9px] font-bold text-emerald-300">
                {syncStatus}
              </div>
            )}
            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col 2xl:flex-row">
              <button type="button" onClick={() => setRowsOpen(value => !value)} className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-[9px] font-black tracking-[0.1em] text-emerald-200 transition hover:bg-emerald-400/20"><Database size={14} className="shrink-0" /> <span>{rowsOpen ? 'HIDE TABLE' : 'VIEW DATA TABLE'}</span><span className="text-emerald-100/60">{COMMUNITY_RECORDS.length} × {COMMUNITY_COLUMNS.length}</span></button>
              <a href="/data/community_final.csv" download="community_final.csv" className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded border border-yellow-400/45 bg-yellow-400 px-3 py-2 text-[9px] font-black tracking-[0.1em] text-black transition hover:bg-yellow-300"><Download size={14} className="shrink-0" /> DOWNLOAD CSV</a>
              <a href={getBlueZoneTransitionUrl()} className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded border border-cyan-400/50 bg-cyan-500/20 px-3 py-2 text-[9px] font-black tracking-[0.1em] text-cyan-200 transition hover:bg-cyan-500/30"><span>PROCEED TO BLUE ZONE &rarr;</span></a>
            </div>
            <p className="mt-1.5 text-[8px] leading-relaxed text-emerald-100/50">Download the original export directly, inspect all fields in the table, or advance to the Blue Zone transition.</p>
          </div>
        ) : (
          <form onSubmit={submitFlag} className="min-w-0">
            <label htmlFor="main-recovery-flag" className="mb-1 block text-[8px] font-bold tracking-[0.16em] text-zinc-500">ENTER COMPLETED FLAG</label>
            <div className="flex min-w-0 gap-2">
              <input id="main-recovery-flag" autoComplete="off" spellCheck={false} value={flagInput} onChange={event => setFlagInput(event.target.value)} placeholder="FLAG{...}" className="min-w-0 flex-1 rounded border border-[#394657] bg-[#05080c] px-3 py-3 font-mono text-xs text-white outline-none transition focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20" aria-describedby="main-recovery-help" />
              <button type="submit" className="flex shrink-0 items-center justify-center gap-2 rounded bg-yellow-400 px-4 py-3 text-[10px] font-black tracking-[0.13em] text-black transition hover:bg-yellow-300 active:scale-[0.99]"><KeyRound size={14} /> SUBMIT</button>
            </div>
            <p id="main-recovery-help" className="mt-1 text-[8px] leading-relaxed text-zinc-500">Use the School export order. Incorrect attempts do not erase evidence.</p>
            {flagMessage && <p role="status" aria-live="polite" className={`mt-1 text-[9px] font-bold ${flagMessage.startsWith('CONGRATULATIONS') ? 'text-emerald-300' : 'text-rose-300'}`}>{flagMessage}</p>}
          </form>
        )}
      </div>
      {solved && rowsOpen && (
        <div className="border-t border-emerald-500/20 px-3 py-3 sm:px-4">
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[9px] leading-relaxed text-emerald-100/75">SOURCE EXPORT // <span className="font-bold text-emerald-200">community_final.csv</span> · {COMMUNITY_RECORDS.length} resident records · {COMMUNITY_COLUMNS.length} fields per record</div>
            <a href="/data/community_final.csv" download="community_final.csv" className="inline-flex shrink-0 items-center justify-center rounded border border-emerald-400/35 bg-emerald-400/10 px-3 py-2 text-[9px] font-black tracking-[0.12em] text-emerald-200 transition hover:bg-emerald-400/20">DOWNLOAD ORIGINAL CSV</a>
          </div>
          <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <label htmlFor="community-dataset-search" className="text-[8px] font-bold tracking-[0.12em] text-zinc-500">SEARCH ALL COLUMNS</label>
            <input id="community-dataset-search" value={datasetSearch} onChange={event => setDatasetSearch(event.target.value)} placeholder="Search ID, role, status, location…" className="w-full rounded border border-[#304438] bg-[#050b08] px-3 py-2 font-mono text-[10px] text-white outline-none focus:border-emerald-400 sm:max-w-xs" />
          </div>
          <div className="mb-1 text-[8px] text-zinc-500">SHOWING {COMMUNITY_RECORDS.filter(row => row.some(cell => cell.toLowerCase().includes(datasetSearch.trim().toLowerCase()))).length} OF {COMMUNITY_RECORDS.length} RECORDS · SCROLL HORIZONTALLY TO VIEW ALL {COMMUNITY_COLUMNS.length} COLUMNS</div>
          <div className="max-h-[52vh] overflow-auto rounded border border-[#1c352c]">
            <table className="w-max min-w-full text-left text-[9px]">
              <thead className="sticky top-0 z-10 bg-[#10221d] text-emerald-200"><tr>{COMMUNITY_COLUMNS.map((label, i) => <th key={label} className={`whitespace-nowrap border-b border-emerald-500/20 px-3 py-2 font-bold ${i === 0 ? 'sticky left-0 z-20 bg-[#10221d]' : ''}`}>{label}</th>)}</tr></thead>
              <tbody>{COMMUNITY_RECORDS.filter(row => row.some(cell => cell.toLowerCase().includes(datasetSearch.trim().toLowerCase()))).map(row => <tr key={row[0]} className="border-t border-[#20352d] hover:bg-emerald-950/30">{row.map((cell, i) => <td key={`${row[0]}-${COMMUNITY_COLUMNS[i]}`} className={`whitespace-nowrap border-r border-[#142a22] px-3 py-2 text-zinc-300 ${i === 0 ? 'sticky left-0 z-[1] bg-[#0a1712] font-bold text-emerald-100' : ''}`}>{cell || '—'}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <p className="mt-2 text-[8px] leading-relaxed text-zinc-500">The 18 records mentioned in the case are the public-index discrepancy. This export itself contains all 120 source rows; do not confuse the number of disputed records with the size of the dataset.</p>
        </div>
      )}
    </section>
  );
};
