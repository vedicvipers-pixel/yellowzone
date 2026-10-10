import React, { useState } from 'react';
import { CTFData, BuildingData } from '../types/protocol';
import { sound } from '../utils/sound';
import { 
  X, 
  Terminal, 
  Key, 
  CheckCircle2, 
  Lock, 
  AlertTriangle, 
  Sparkles,
  Database,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface CTFModalProps {
  ctf: CTFData;
  building: BuildingData;
  onClose: () => void;
  onSolve: (ctfId: string) => void;
}

export const CTFModal: React.FC<CTFModalProps> = ({
  ctf,
  building,
  onClose,
  onSolve
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [submittedFlag, setSubmittedFlag] = useState<string>('');
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [schoolScheduleVerified, setSchoolScheduleVerified] = useState(false);
  const [schoolAssignments, setSchoolAssignments] = useState({
    HISTORY: { room: '', time: '' },
    ASTRA: { room: '', time: '' },
    SYSTEMS: { room: '', time: '' }
  });
  const [triageSequence, setTriageSequence] = useState<string[]>([]);
  const triageSteps = [
    { id: 'bus-stabilize', label: 'STABILIZE WARD BUS' },
    { id: 'archive-release', label: 'RELEASE ARCHIVE LOCK' },
    { id: 'case-reconcile', label: 'RECONCILE CASE H-017' },
    { id: 'cache-flush', label: 'FLUSH DUPLICATE CACHE' }
  ];
  const mechanicComplete = ctf.puzzleMechanic === 'timetable'
    ? schoolScheduleVerified
    : ctf.puzzleMechanic === 'triage'
      ? triageSequence.length === triageSteps.length
      : true;

  const updateSchoolAssignment = (session: 'HISTORY' | 'ASTRA' | 'SYSTEMS', field: 'room' | 'time', value: string) => {
    setSchoolAssignments(previous => ({
      ...previous,
      [session]: { ...previous[session], [field]: value }
    }));
    setSchoolScheduleVerified(false);
    setErrorMessage('');
  };

  const verifySchoolSchedule = () => {
    const a = schoolAssignments;
    const correct =
      a.HISTORY.room === 'OBSERVATORY' && a.HISTORY.time === '08:10' &&
      a.ASTRA.room === 'ARCHIVE-03' && a.ASTRA.time === '08:40' &&
      a.SYSTEMS.room === 'LAB-02' && a.SYSTEMS.time === '09:10';
    setSchoolScheduleVerified(correct);
    setErrorMessage(correct ? '' : 'SCHEDULE INVALID // COLLISION OR CONSTRAINT VIOLATION.');
    if (correct) sound.playTerminalBeep(true);
    else sound.playTerminalBeep(false);
  };

  const executeTriageAction = (actionId: string) => {
    if (triageSequence.length === triageSteps.length) return;
    const expected = triageSteps[triageSequence.length]?.id;
    if (actionId !== expected) {
      setTriageSequence([]);
      setErrorMessage('INTERLOCK TRIPPED // RECOVERY SEQUENCE RESET.');
      sound.playTerminalBeep(false);
      return;
    }
    const next = [...triageSequence, actionId];
    setTriageSequence(next);
    setErrorMessage('');
    sound.playClick();
    if (next.length === triageSteps.length) sound.playTerminalBeep(true);
  };

  const handleOptionSelect = (opt: string) => {
    sound.playClick();
    setSelectedOption(opt);
    setErrorMessage('');
  };

  const handleExecuteDecryption = () => {
    const hasOptions = Boolean(ctf.options && ctf.options.length > 0);
    if (hasOptions && !selectedOption) {
      setErrorMessage('Select a conclusion after reviewing the evidence.');
      return;
    }
    if (ctf.puzzleMechanic && !mechanicComplete) {
      setErrorMessage('SIMULATION INCOMPLETE // CONTROL STATE NOT ACCEPTED.');
      return;
    }
    if (!hasOptions && !submittedFlag.trim()) {
      setErrorMessage('No payload received. Enter the recovered FLAG{...} string.');
      return;
    }

    const isCorrect = hasOptions
      ? selectedOption === ctf.solutionKey
      : submittedFlag.trim().toUpperCase() === ctf.flagCode.toUpperCase();
    if (!isCorrect) {
      sound.playTerminalBeep(false);
      setErrorMessage(hasOptions
        ? 'CONCLUSION NOT SUPPORTED. Re-check the source artifacts and try again.'
        : 'PAYLOAD REJECTED // SIGNATURE MISMATCH. Reconstruct the flag from the source artifacts.');
      return;
    }

    sound.playTerminalBeep(true);
    setIsDecrypting(true);
    setErrorMessage('');
    setTimeout(() => {
      setIsDecrypting(false);
      sound.playSuccess();
      onSolve(ctf.id);
    }, 600);
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={`${building.name} CTF terminal`} className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="max-w-2xl w-full bg-[#0d121a] border-2 border-yellow-500/60 rounded-lg shadow-[0_0_50px_rgba(250,204,21,0.25)] flex flex-col overflow-hidden font-mono-code text-xs relative">
        {/* Tactical Corner Brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yellow-400 z-10" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-yellow-400 z-10" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-yellow-400 z-10" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-yellow-400 z-10" />

        {/* Modal Header */}
        <div className="bg-[#121824] px-5 py-3 border-b border-[#253245] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Terminal size={16} className="text-yellow-400" />
            <div>
              <span className="font-tech text-yellow-400 font-bold text-sm tracking-widest">
                {ctf.label} // CTF #{ctf.slot}
              </span>
              <span className="text-zinc-500 text-[10px] ml-2">
                LOCATION: {building.name} ({building.code})
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded hover:bg-[#1f2838] text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Status Alert Banner */}
          <div className={`p-3 rounded border flex items-center justify-between ${
            ctf.completed
              ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
              : 'bg-yellow-950/20 border-yellow-500/40 text-yellow-300'
          }`}>
            <div className="flex items-center gap-2">
              {ctf.completed ? (
                <ShieldCheck size={16} className="text-emerald-400" />
              ) : (
                <Lock size={16} className="text-yellow-400 animate-pulse" />
              )}
              <span className="font-tech text-xs tracking-wider">
                {ctf.completed ? 'FLAG RECOVERED & VERIFIED' : 'ENCRYPTED TERMINAL ACCESS INTERCEPT'}
              </span>
            </div>

            <span className="text-[10px] font-mono-code font-bold">
              TYPE: {ctf.type}
            </span>
          </div>

          {/* Description & Objective */}
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 font-tech">
              Terminal Mission Objective
            </div>
            <p className="text-zinc-200 text-xs leading-relaxed bg-[#10151f] p-3 rounded border border-zinc-800">
              {ctf.description}
            </p>
          </div>

          {/* OSINT Evidence Packet */}
          {ctf.evidence && ctf.evidence.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 text-[10px] font-bold font-tech tracking-wider">
                <Database size={14} />
                <span>RECOVERED SOURCE ARTIFACTS // CORRELATE BEFORE CONCLUDING</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {ctf.evidence.map((item, index) => (
                  <article key={`${item.source}-${index}`} className="bg-[#0b121b] p-3 rounded border border-cyan-900/60">
                    <div className="text-cyan-300 text-[10px] font-bold tracking-wider mb-1">{item.source}</div>
                    <p className="text-zinc-200 text-xs leading-relaxed whitespace-pre-wrap">{item.excerpt}</p>
                    {item.image && (
                      <figure className="mt-3 space-y-1.5">
                        <img
                          src={item.image}
                          alt={item.imageAlt || item.source}
                          className="w-full max-h-[360px] object-contain rounded border border-cyan-900/70 bg-black/40"
                          draggable={false}
                        />
                        <figcaption className="text-[10px] text-zinc-500">ARCHIVE PREVIEW // LL-09</figcaption>
                        <a
                          href={item.image}
                          download={item.image.split('/').pop() || 'museum-evidence.png'}
                          className="inline-flex items-center gap-2 mt-1 px-3 py-2 rounded border border-cyan-700/70 bg-cyan-950/40 text-cyan-200 hover:bg-cyan-900/60 text-[10px] font-bold tracking-wider transition-colors"
                        >
                          DOWNLOAD ORIGINAL PNG FOR ANALYSIS
                        </a>
                      </figure>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* If already completed: show decrypted data & flag */}
          {ctf.completed ? (
            <div className="bg-emerald-950/20 border border-emerald-500/40 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-tech font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  DECRYPTED MEMORY PAYLOAD
                </span>
                <span className="text-[10px] text-emerald-400/80 font-mono-code">INTEGRITY: 100%</span>
              </div>

              <div className="text-emerald-200 text-xs leading-relaxed font-mono-code bg-black/40 p-3 rounded border border-emerald-800/50">
                {ctf.unlockedData}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-emerald-900/50 text-[11px]">
                <span className="text-zinc-400">CAPTURED FLAG:</span>
                <code className="text-yellow-400 font-bold bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/30">
                  {ctf.flagCode}
                </code>
              </div>
            </div>
          ) : (
            /* Interactive Challenge / Decryption Options */
            <div className="space-y-3">
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-tech flex items-center justify-between">
                <span>{ctf.challengePrompt}</span>
                <span className="text-yellow-400">{ctf.puzzleMechanic ? 'INTERACTIVE PUZZLE' : 'FLAG SUBMISSION'}</span>
              </div>

              {ctf.puzzleMechanic === 'timetable' && (
                <div className="rounded border border-amber-800/60 bg-[#10151f] p-4 space-y-3">
                  <div className="text-amber-300 font-bold tracking-widest text-[10px]">SCHEDULE ENGINE // THREE SESSION ASSIGNMENTS</div>
                  <p className="text-zinc-400 text-[10px]">Assign each session one room and one period. A room or period cannot be used twice.</p>
                  {(['HISTORY', 'ASTRA', 'SYSTEMS'] as const).map(session => (
                    <div key={session} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center border-b border-zinc-800 pb-2">
                      <span className="text-cyan-200 font-bold">{session}</span>
                      <select aria-label={`${session} room`} value={schoolAssignments[session].room} onChange={e => updateSchoolAssignment(session, 'room', e.target.value)} className="bg-black/50 border border-zinc-700 rounded p-2 text-zinc-200">
                        <option value="">SELECT ROOM</option>
                        <option value="OBSERVATORY">OBSERVATORY</option>
                        <option value="ARCHIVE-03">ARCHIVE-03</option>
                        <option value="LAB-02">LAB-02</option>
                      </select>
                      <select aria-label={`${session} time`} value={schoolAssignments[session].time} onChange={e => updateSchoolAssignment(session, 'time', e.target.value)} className="bg-black/50 border border-zinc-700 rounded p-2 text-zinc-200">
                        <option value="">SELECT PERIOD</option>
                        <option value="08:10">08:10</option>
                        <option value="08:40">08:40</option>
                        <option value="09:10">09:10</option>
                      </select>
                    </div>
                  ))}
                  <button type="button" onClick={verifySchoolSchedule} className="px-3 py-2 rounded border border-amber-500/70 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 font-bold tracking-wider">VERIFY SCHEDULE</button>
                  {schoolScheduleVerified && <p className="text-emerald-300 text-[10px]">SCHEDULE ACCEPTED // ARCHIVE SIGNATURE CHANNEL OPEN.</p>}
                </div>
              )}

              {ctf.puzzleMechanic === 'triage' && (
                <div className="rounded border border-rose-900/70 bg-[#10151f] p-4 space-y-3">
                  <div className="text-rose-300 font-bold tracking-widest text-[10px]">WARD CONTROL // INTERLOCK SIMULATOR</div>
                  <p className="text-zinc-400 text-[10px]">Execute the control operations. Invalid transitions trip the interlock and reset the sequence. This is a fictional system-control puzzle, not medical guidance.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: 'bus-stabilize', label: 'STABILIZE WARD BUS' },
                      { id: 'archive-release', label: 'RELEASE ARCHIVE LOCK' },
                      { id: 'case-reconcile', label: 'RECONCILE CASE H-017' },
                      { id: 'cache-flush', label: 'FLUSH DUPLICATE CACHE' }
                    ].map(action => {
                      const completed = triageSequence.includes(action.id);
                      return <button key={action.id} type="button" onClick={() => executeTriageAction(action.id)} disabled={completed || triageSequence.length === triageSteps.length} className={`text-left rounded border px-3 py-3 font-bold tracking-wider transition-colors ${completed ? 'border-emerald-700 bg-emerald-950/30 text-emerald-300' : 'border-zinc-700 bg-black/30 text-zinc-200 hover:border-rose-500/70'}`}>{completed ? '✓ ' : '▸ '}{action.label}</button>;
                    })}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500"><span>INTERLOCK OPERATIONS ACCEPTED</span><span>{triageSequence.length}/4</span></div>
                  <div className="h-1.5 bg-zinc-800 rounded overflow-hidden"><div className="h-full bg-emerald-400 transition-all" style={{ width: `${triageSequence.length * 25}%` }} /></div>
                  {mechanicComplete && <p className="text-emerald-300 text-[10px]">WARD STATE CONSISTENT // CASE SIGNATURE CHANNEL OPEN.</p>}
                </div>
              )}

              {/* Multiple-choice for legacy terminals; free-response flag input for OSINT cases */}
              {ctf.options && ctf.options.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ctf.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(opt)}
                      className={`p-2.5 rounded border text-left cursor-pointer transition-all flex items-center justify-between ${
                        selectedOption === opt
                          ? 'border-yellow-400 bg-yellow-500/15 text-yellow-300 font-bold'
                          : 'border-zinc-800 bg-[#121722] hover:border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <span className="font-mono-code text-xs">{opt}</span>
                      {selectedOption === opt && (
                        <span className="w-2 h-2 rounded-full bg-yellow-400" />
                      )}
                    </button>
                  ))}
                </div>
              ) : mechanicComplete ? (
                <div className="space-y-2">
                  <label htmlFor="flag-payload" className="block text-[10px] text-cyan-300 font-tech tracking-widest">
                    RECOVERED PAYLOAD // MANUAL ENTRY
                  </label>
                  <input
                    id="flag-payload"
                    type="text"
                    value={submittedFlag}
                    onChange={(event) => { setSubmittedFlag(event.target.value); setErrorMessage(''); }}
                    onKeyDown={(event) => { if (event.key === 'Enter' && !isDecrypting) handleExecuteDecryption(); }}
                    placeholder="FLAG{...}"
                    autoComplete="off"
                    spellCheck={false}
                    className="select-text w-full rounded border border-cyan-900/80 bg-black/60 px-3 py-3 text-sm text-cyan-100 placeholder:text-zinc-600 outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 font-mono-code"
                  />
                  <p className="text-[10px] text-zinc-500">Exact string required. Whitespace around the payload is ignored.</p>
                </div>
              ) : (
                <div className="rounded border border-zinc-800 bg-black/20 p-3 text-zinc-500 text-[10px]">COMPLETE THE ACTIVE SIMULATION TO OPEN FLAG SUBMISSION.</div>
              )}

              {errorMessage && (
                <div className="text-red-400 text-xs flex items-center gap-1.5 mt-2">
                  <AlertTriangle size={14} />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#10151f] px-5 py-3 border-t border-[#253245] flex items-center justify-between gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-700 text-zinc-300 font-tech font-bold text-xs cursor-pointer transition-colors"
          >
            DISCONNECT
          </button>

          {!ctf.completed ? (
            <button
              onClick={handleExecuteDecryption}
              disabled={isDecrypting || !mechanicComplete || (ctf.options && ctf.options.length > 0 ? !selectedOption : !submittedFlag.trim())}
              className="px-5 py-2 rounded bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black font-tech font-bold text-xs tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(250,204,21,0.4)] transition-all disabled:opacity-50"
            >
              <Key size={14} />
              <span>{isDecrypting ? 'DECRYPTING MEMORY STREAM...' : 'SUBMIT FINDING / RECOVER FLAG'}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-5 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-tech font-bold text-xs tracking-wider cursor-pointer"
            >
              RETURN TO ROOM
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
