import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { BUILDINGS_DATA, INITIAL_RESIDENTS, INITIAL_SYSTEM_LOGS } from './data/protocolData';
import { BuildingData, ResidentRecord, LogEntry, BuildingId } from './types/protocol';
import { SystemHeader } from './components/SystemHeader';
import { CommunityMap } from './components/CommunityMap';
import { BuildingPanel } from './components/BuildingPanel';
import { BuildingEntrance } from './components/BuildingEntrance';
import { CommunityProgress } from './components/CommunityProgress';
import { InvestigationTerminal } from './components/InvestigationTerminal';
import { MainFlagSubmissionStrip, MainInvestigationPanel, type FlagResult } from './components/MainInvestigationPanel';
import { ResidentRecordPanel } from './components/ResidentRecordPanel';
import { SystemLogsModal } from './components/SystemLogsModal';
import { SectorGate } from './components/SectorGate';
import { sound } from './utils/sound';
import { STORAGE_KEYS } from './data/investigationData';
import { getResolvedTeamId, fetchYellowZoneProgress, clearYellowZoneLocalSolved } from './utils/supabaseSync';

export function App() {
  const teamId = getResolvedTeamId();
  const [isSolved, setIsSolved] = useState<boolean>(() => {
    if (!teamId) return false;
    try {
      return window.localStorage.getItem(`yellow_solved_${teamId}`) !== null ||
             window.localStorage.getItem(`${STORAGE_KEYS.solved}_${teamId}`) === 'true';
    } catch {
      return false;
    }
  });

  // Protocol State
  const [buildings, setBuildings] = useState<BuildingData[]>(BUILDINGS_DATA);
  const [residents, setResidents] = useState<Record<string, ResidentRecord>>(INITIAL_RESIDENTS);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_SYSTEM_LOGS);

  // Navigation State
  const [activeView, setActiveView] = useState<'gate' | 'map' | 'building'>('gate');
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingData | null>(null);
  const [activeBuilding, setActiveBuilding] = useState<BuildingData | null>(null);

  // Modals & Panels
  const [showInvestigationTerminal, setShowInvestigationTerminal] = useState(false);
  const [showResidentsModal, setShowResidentsModal] = useState<boolean>(false);
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null);
  const [showLogsModal, setShowLogsModal] = useState<boolean>(false);
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [showCommunityStatus, setShowCommunityStatus] = useState<boolean>(false);
  const [zoneFeedback, setZoneFeedback] = useState<FlagResult | null>(null);

  useEffect(() => {
    const checkSolved = () => {
      const currentTeam = getResolvedTeamId();
      if (!currentTeam) {
        setIsSolved(false);
        return;
      }
      try {
        const solved = window.localStorage.getItem(`yellow_solved_${currentTeam}`) !== null ||
                       window.localStorage.getItem(`${STORAGE_KEYS.solved}_${currentTeam}`) === 'true';
        setIsSolved(solved);
      } catch {
        setIsSolved(false);
      }
    };
    checkSolved();

    if (teamId) {
      fetchYellowZoneProgress(teamId).then((res) => {
        if (!res.isCompleted) {
          clearYellowZoneLocalSolved(teamId);
          setIsSolved(false);
        } else {
          setIsSolved(true);
        }
      });
    }

    window.addEventListener('manu-ledger-state-change', checkSolved);
    window.addEventListener('storage', checkSolved);
    return () => {
      window.removeEventListener('manu-ledger-state-change', checkSolved);
      window.removeEventListener('storage', checkSolved);
    };
  }, [teamId]);

  useEffect(() => {
    if (!zoneFeedback) return;
    const timer = window.setTimeout(() => setZoneFeedback(null), zoneFeedback === 'wrong' ? 950 : 1250);
    return () => window.clearTimeout(timer);
  }, [zoneFeedback]);

  const handleFlagResult = (result: FlagResult) => {
    setZoneFeedback(null);
    window.requestAnimationFrame(() => setZoneFeedback(result));
  };

  // Progress is intentionally not tied to the retired standalone CTF flow.
  const totalSolved = 0;
  const totalCtfs = buildings.length;

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

  // Reset investigation prototype state
  const handleResetPrototype = () => {
    sound.playClick();
    if (window.confirm('Reset the investigation prototype and restore its initial state?')) {
      setBuildings(BUILDINGS_DATA);
      setResidents(INITIAL_RESIDENTS);
      setLogs(INITIAL_SYSTEM_LOGS);
      setActiveView('map');
      setSelectedBuilding(null);
      setActiveBuilding(null);
      setShowInvestigationTerminal(false);
      try {
        window.localStorage.removeItem(STORAGE_KEYS.saved);
        window.localStorage.removeItem(STORAGE_KEYS.solved);
      } catch { /* Storage is optional; the visible prototype still resets. */ }
      window.dispatchEvent(new Event('manu-ledger-state-change'));
      addLog('SYSTEM', 'Prototype state purged. Identity scrub initialized to baseline.', 'warn');
    }
  };

  return (
    <div className={`relative w-screen h-screen overflow-hidden flex flex-col bg-[#07090e] text-[#e2e8f0] ${crtEnabled ? 'crt-overlay' : ''}`}>
      {/* Universal In-World MANU Protocol Header */}
      <SystemHeader
        totalSolved={isSolved ? 1 : 0}
        totalCtfs={1}
        onOpenResidents={() => setShowResidentsModal(true)}
        onOpenLogs={() => setShowLogsModal(true)}
        onReset={handleResetPrototype}
        onToggleCrt={() => setCrtEnabled(!crtEnabled)}
        crtEnabled={crtEnabled}
        activeBuildingName={activeBuilding ? activeBuilding.name : undefined}
        onReturnToMap={activeView === 'building' ? handleReturnToMap : undefined}
        onReturnToGate={activeView !== 'gate' ? handleReturnToGate : undefined}
        teamId={teamId}
        isSolved={isSolved}
      />

      {/* Main View Area */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex">
        {activeView === 'gate' ? (
          /* Sector Perimeter Decontamination Gate */
          <SectorGate onBreachGate={handleBreachGate} />
        ) : activeView === 'map' ? (
          <div className={`map-zone-shell relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${zoneFeedback === 'wrong' ? 'map-zone-feedback-wrong' : zoneFeedback === 'correct' ? 'map-zone-feedback-correct' : ''}`}>
            {/* Map and story dossier stay in the upper row; the wide recovery strip sits beneath them. */}
            <div className="relative flex min-h-0 flex-1 overflow-hidden">
              <CommunityMap
                buildings={buildings}
                selectedBuilding={selectedBuilding}
                onSelectBuilding={setSelectedBuilding}
                onEnterBuilding={handleEnterBuilding}
              />
              <MainInvestigationPanel
                buildings={buildings}
                onSelectBuilding={setSelectedBuilding}
              />

              {/* Toggleable Community Status panel. Collapsed by default so the map stays visible. */}
              <div className="absolute bottom-4 left-4 z-30 hidden md:block pointer-events-none">
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
            </div>
            <MainFlagSubmissionStrip onFlagResult={handleFlagResult} />
          </div>
        ) : (
          /* Entrance room with 3D FPP walkthrough and shared investigation terminal */
          activeBuilding && (
            <BuildingEntrance
              building={activeBuilding}
              onReturnToMap={handleReturnToMap}
              onSelectCTF={() => setShowInvestigationTerminal(true)}
              onOpenResidentDossier={handleOpenResidentDossier}
            />
          )
        )}
      </div>

      {/* Shared Social Trace Investigation Terminal */}
      {showInvestigationTerminal && activeBuilding && (
        <InvestigationTerminal
          building={activeBuilding}
          onClose={() => setShowInvestigationTerminal(false)}
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
