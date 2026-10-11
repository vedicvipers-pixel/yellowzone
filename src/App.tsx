import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Activity, CheckCircle2, Database } from 'lucide-react';
import { BUILDINGS_DATA, INITIAL_RESIDENTS, INITIAL_SYSTEM_LOGS } from './data/protocolData';
import { BuildingData, CTFData, ResidentRecord, LogEntry, BuildingId } from './types/protocol';
import { SystemHeader } from './components/SystemHeader';
import { CommunityMap } from './components/CommunityMap';
import { BuildingPanel } from './components/BuildingPanel';
import { BuildingEntrance } from './components/BuildingEntrance';
import { CommunityProgress } from './components/CommunityProgress';
import { CTFModal } from './components/CTFModal';
import { ResidentRecordPanel } from './components/ResidentRecordPanel';
import { SystemLogsModal } from './components/SystemLogsModal';
import { SectorGate } from './components/SectorGate';
import { sound } from './utils/sound';
import { 
  getResolvedTeamId, 
  fetchYellowZoneProgress, 
  recordYellowCtfSolve, 
  syncYellowZoneToSupabase 
} from './utils/supabaseSync';

export function App() {
  // Protocol State
  const [buildings, setBuildings] = useState<BuildingData[]>(BUILDINGS_DATA);
  const [residents, setResidents] = useState<Record<string, ResidentRecord>>(INITIAL_RESIDENTS);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_SYSTEM_LOGS);

  // Navigation State
  const [activeView, setActiveView] = useState<'gate' | 'map' | 'building'>('gate');
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingData | null>(null);
  const [activeBuilding, setActiveBuilding] = useState<BuildingData | null>(null);

  // Modals & Panels
  const [activeCTF, setActiveCTF] = useState<CTFData | null>(null);
  const [showResidentsModal, setShowResidentsModal] = useState<boolean>(false);
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null);
  const [showLogsModal, setShowLogsModal] = useState<boolean>(false);
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [showCommunityStatus, setShowCommunityStatus] = useState<boolean>(false);

  // Apply Solved Challenges to Buildings and Resident Records
  const applySolvedChallenges = (solvedIds: string[]) => {
    if (!solvedIds || solvedIds.length === 0) return;
    setBuildings(prevBuildings => {
      return prevBuildings.map(b => {
        const updatedCtfs = b.ctfs.map(c => {
          if (solvedIds.includes(c.id)) {
            return { ...c, completed: true };
          }
          return c;
        });
        return { ...b, ctfs: updatedCtfs };
      });
    });

    setResidents(prevResidents => {
      const next = { ...prevResidents };
      for (const b of BUILDINGS_DATA) {
        const hasSolve = b.ctfs.some(c => solvedIds.includes(c.id));
        if (hasSolve && b.residentId && next[b.residentId]) {
          const res = next[b.residentId];
          next[b.residentId] = {
            ...res,
            encryptedFragmentsRecovered: 1,
            recordCompleteness: Math.min(100, res.recordCompleteness + 60),
            status: 'NOMINAL'
          };
        }
      }
      return next;
    });
  };

  // Hydrate solved CTFs on mount from Supabase & local cache
  useEffect(() => {
    const teamId = getResolvedTeamId();
    try {
      const cached = localStorage.getItem(`yellow_solved_${teamId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          applySolvedChallenges(parsed);
        }
      }
    } catch {}

    fetchYellowZoneProgress(teamId).then(({ solvedChallenges }) => {
      if (solvedChallenges && solvedChallenges.length > 0) {
        applySolvedChallenges(solvedChallenges);
        try {
          localStorage.setItem(`yellow_solved_${teamId}`, JSON.stringify(solvedChallenges));
        } catch {}
      }
    });
  }, []);

  // Compute Total Solved CTFs
  const totalSolved = buildings.reduce((acc, b) => {
    return acc + b.ctfs.filter(c => c.completed).length;
  }, 0);
  const totalCtfs = buildings.length;

  // Auto-sync completion to Supabase when all CTFs are completed
  useEffect(() => {
    if (totalSolved >= totalCtfs && totalCtfs > 0) {
      syncYellowZoneToSupabase();
    }
  }, [totalSolved, totalCtfs]);

  // Add Log Helper
  const addLog = (category: LogEntry['category'], message: string, level: LogEntry['level'] = 'info') => {
    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} SZT`;
    const newEntry: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: ts,
      category,
      message,
      level
    };
    setLogs(prev => [newEntry, ...prev.slice(0, 49)]);
  };

  // Breach Security Gate
  const handleBreachGate = () => {
    setActiveView('map');
    addLog('SECURITY', 'Decontamination verified. Perimeter Aperture Gate-01 breached. Ingress to Yellow Zone.', 'success');
  };

  // Return to Gate
  const handleReturnToGate = () => {
    sound.playAirlock();
    setActiveView('gate');
    setSelectedBuilding(null);
    setActiveBuilding(null);
    addLog('SECURITY', 'Operative returned to Sector Perimeter Gate-01.', 'info');
  };

  // Enter a building
  const handleEnterBuilding = (building: BuildingData) => {
    sound.playAirlock();
    setActiveBuilding(building);
    setSelectedBuilding(null);
    setActiveView('building');
    addLog('SECURITY', `Agent entered entrance room of ${building.name} (${building.code}).`, 'info');
  };

  // Return to Map
  const handleReturnToMap = () => {
    sound.playAirlock();
    setActiveView('map');
    if (activeBuilding) {
      addLog('SECURITY', `Agent exited ${activeBuilding.name} and returned to Community Map.`, 'info');
    }
    setActiveBuilding(null);
  };

  // Solve a CTF terminal
  const handleSolveCTF = (ctfId: string) => {
    if (!activeBuilding) return;

    const foundCTF = activeBuilding.ctfs.find(c => c.id === ctfId);
    if (!foundCTF) return;
    const resolvedCTF: CTFData = { ...foundCTF, completed: true };

    // Record solve and award 20 pts in Supabase & local cache
    recordYellowCtfSolve(ctfId);

    // 1. Update Building CTF status
    const updatedBuildings = buildings.map(b => {
      if (b.id === activeBuilding.id) {
        const updatedCtfs = b.ctfs.map(c => {
          if (c.id === ctfId) {
            return resolvedCTF;
          }
          return c;
        });
        return { ...b, ctfs: updatedCtfs };
      }
      return b;
    });

    setBuildings(updatedBuildings);
    const updatedActiveBuilding = updatedBuildings.find(b => b.id === activeBuilding.id);
    if (updatedActiveBuilding) {
      setActiveBuilding(updatedActiveBuilding);
    }

    setActiveCTF(resolvedCTF);
    addLog('CTF', `Decrypted terminal ${resolvedCTF.label} in ${activeBuilding.name}. Signature verified (+20 PTS).`, 'success');

    // 2. Restore Resident Record Data
    const residentKey = activeBuilding.residentId;
    if (residentKey && residents[residentKey]) {
      setResidents(prev => {
        const currentRes = prev[residentKey];
        const newRecoveredCount = Math.min(1, currentRes.encryptedFragmentsRecovered + 1);
        const newCompleteness = Math.min(100, currentRes.recordCompleteness + 60);
        const newStatus = newCompleteness >= 90 ? 'NOMINAL' : currentRes.status;

        return {
          ...prev,
          [residentKey]: {
            ...currentRes,
            encryptedFragmentsRecovered: newRecoveredCount,
            recordCompleteness: newCompleteness,
            status: newStatus,
            lastUpdate: `Cycle 841.04 // Restored by MANU Agent`
          }
        };
      });

      addLog('BIOMETRIC', `Restored memory fragment for resident ${residents[residentKey].fullName} (${residentKey}). Record completeness +60%.`, 'success');
    }

    // 3. Sync to Supabase if Society CTF solved or all 5 solved
    const solvedCountNow = updatedBuildings.reduce((acc, b) => acc + b.ctfs.filter(c => c.completed).length, 0);
    if (solvedCountNow >= updatedBuildings.length || activeBuilding.id === 'society') {
      syncYellowZoneToSupabase();
    }
  };

  // Quick jump from CommunityProgress widget
  const handleSelectBuildingFromTracker = (id: BuildingId) => {
    const b = buildings.find(item => item.id === id);
    if (!b) return;
    if (activeView === 'map') {
      setSelectedBuilding(b);
    } else {
      setActiveBuilding(b);
    }
  };

  // Open resident dossier drawer
  const handleOpenResidentDossier = (residentId?: string) => {
    if (residentId) {
      setSelectedResidentId(residentId);
    } else if (activeBuilding) {
      setSelectedResidentId(activeBuilding.residentId);
    }
    setShowResidentsModal(true);
  };

  // Reset entire prototype state
  const handleResetPrototype = () => {
    sound.playClick();
    if (window.confirm('Reset all recovered CTFs and restore initial corrupted state?')) {
      setBuildings(BUILDINGS_DATA);
      setResidents(INITIAL_RESIDENTS);
      setLogs(INITIAL_SYSTEM_LOGS);
      setActiveView('map');
      setSelectedBuilding(null);
      setActiveBuilding(null);
      setActiveCTF(null);
      addLog('SYSTEM', 'Prototype state purged. Identity scrub initialized to baseline.', 'warn');
    }
  };

  return (
    <div className={`relative w-screen h-screen overflow-hidden flex flex-col bg-[#07090e] text-[#e2e8f0] ${crtEnabled ? 'crt-overlay' : ''}`}>
      {/* Universal In-World MANU Protocol Header */}
      <SystemHeader
        totalSolved={totalSolved}
        totalCtfs={totalCtfs}
        onOpenResidents={() => setShowResidentsModal(true)}
        onOpenLogs={() => setShowLogsModal(true)}
        onReset={handleResetPrototype}
        onToggleCrt={() => setCrtEnabled(!crtEnabled)}
        crtEnabled={crtEnabled}
        activeBuildingName={activeBuilding ? activeBuilding.name : undefined}
        onReturnToMap={activeView === 'building' ? handleReturnToMap : undefined}
        onReturnToGate={activeView !== 'gate' ? handleReturnToGate : undefined}
      />

      {/* Main View Area */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex">
        {activeView === 'gate' ? (
          /* Sector Perimeter Decontamination Gate */
          <SectorGate onBreachGate={handleBreachGate} />
        ) : activeView === 'map' ? (
          <>
            {/* Top-Down Interactive Community Map */}
            <div className="relative flex-1 h-full overflow-hidden flex">
              <CommunityMap
                buildings={buildings}
                selectedBuilding={selectedBuilding}
                onSelectBuilding={setSelectedBuilding}
                onEnterBuilding={handleEnterBuilding}
              />

              {/* Toggleable Community Status panel. Collapsed by default so the map stays visible. */}
              <div className="absolute bottom-12 left-4 z-30 hidden md:block pointer-events-none">
                {showCommunityStatus ? (
                  <div className="relative pointer-events-auto animate-in fade-in slide-in-from-left-2 duration-200">
                    <button
                      type="button"
                      aria-label="Hide community status"
                      title="Hide community status"
                      onClick={() => setShowCommunityStatus(false)}
                      className="absolute -right-3 top-3 z-40 flex h-7 w-7 items-center justify-center rounded-full border border-yellow-500/60 bg-[#10141b] text-yellow-300 shadow-lg transition hover:bg-yellow-500/15 hover:text-yellow-100"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <CommunityProgress
                      buildings={buildings}
                      onSelectBuilding={handleSelectBuildingFromTracker}
                      activeBuildingId={selectedBuilding?.id}
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    aria-label="Show community status"
                    title="Show community status"
                    onClick={() => setShowCommunityStatus(true)}
                    className="pointer-events-auto flex items-center gap-2 rounded-r-lg rounded-l-md border border-yellow-500/50 border-l-2 border-l-yellow-400 bg-[#10141b]/95 px-3 py-2.5 font-mono-code text-[10px] font-bold tracking-widest text-yellow-300 shadow-lg shadow-black/30 backdrop-blur-md transition hover:border-yellow-300 hover:bg-[#18202b] hover:text-yellow-100"
                  >
                    <Activity size={14} />
                    <span>COMMUNITY STATUS</span>
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>

              {/* Inspect / Telemetry Side Panel (When a building is selected on map) */}
              {selectedBuilding && (
                <BuildingPanel
                  building={selectedBuilding}
                  onClose={() => setSelectedBuilding(null)}
                  onEnter={handleEnterBuilding}
                  onOpenResidentDossier={handleOpenResidentDossier}
                />
              )}

              {/* Sector Cleared Floating Tactical Banner */}
              {totalSolved >= totalCtfs && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 max-w-2xl w-[94%] bg-[#0c121c]/95 border-2 border-emerald-500 rounded-lg p-3.5 shadow-[0_0_35px_rgba(16,185,129,0.35)] backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono-code">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-emerald-500/20 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shrink-0">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <div className="font-tech font-bold text-xs sm:text-sm text-emerald-400 tracking-wider flex items-center gap-2">
                          <span>YELLOW ZONE FULLY RESTORED</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">5 / 5 SOLVED</span>
                        </div>
                        <div className="text-[11px] text-zinc-300 mt-0.5">
                          Community dataset fragment unlocked. Blue Zone transit corridor available.
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
                      <a
                        href="/community_final.csv"
                        download="community_final.csv"
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-tech font-bold text-xs tracking-wider transition-all shadow-[0_0_15px_rgba(52,211,153,0.4)] flex items-center justify-center gap-1.5 cursor-pointer"
                        id="map-download-community-final"
                      >
                        <Database size={13} />
                        <span>DOWNLOAD community_final.csv ⤓</span>
                      </a>
                      <a
                        href="https://yellow-to-blue-slideshow.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none px-4 py-2 rounded bg-cyan-400 hover:bg-cyan-300 text-black font-tech font-bold text-xs tracking-wider transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)] flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
                        id="map-move-to-blue-zone"
                      >
                        <span>MOVE TO BLUE ZONE →</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Entrance Room Interface (1 Room per Building with 3D FPP Walkthrough & 1 CTF) */
          activeBuilding && (
            <BuildingEntrance
              building={activeBuilding}
              onReturnToMap={handleReturnToMap}
              onSelectCTF={(ctf) => setActiveCTF(ctf)}
              onOpenResidentDossier={handleOpenResidentDossier}
              isAllSolved={totalSolved >= totalCtfs}
            />
          )
        )}
      </div>

      {/* Interactive CTF Terminal Challenge Modal */}
      {activeCTF && activeBuilding && (
        <CTFModal
          ctf={activeCTF}
          building={activeBuilding}
          onClose={() => setActiveCTF(null)}
          onSolve={handleSolveCTF}
          isAllSolved={totalSolved >= totalCtfs}
        />
      )}

      {/* Recovered Citizen Identity Records Drawer / Modal */}
      {showResidentsModal && (
        <ResidentRecordPanel
          residents={residents}
          selectedResidentId={selectedResidentId}
          onSelectResident={setSelectedResidentId}
          onClose={() => setShowResidentsModal(false)}
        />
      )}

      {/* Terminal System Audit Logs Modal */}
      {showLogsModal && (
        <SystemLogsModal
          logs={logs}
          onClose={() => setShowLogsModal(false)}
          onClearLogs={() => setLogs([])}
        />
      )}
    </div>
  );
}

export default App;
