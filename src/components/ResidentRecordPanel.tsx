import React, { useState } from 'react';
import { ResidentRecord, BuildingId } from '../types/protocol';
import { sound } from '../utils/sound';
import { 
  X, 
  Users, 
  Search, 
  AlertTriangle, 
  FileText, 
  ShieldAlert, 
  Clock, 
  Home, 
  Briefcase, 
  CheckCircle2,
  Calendar,
  Lock,
  Cpu
} from 'lucide-react';

interface ResidentRecordPanelProps {
  residents: Record<string, ResidentRecord>;
  selectedResidentId: string | null;
  onSelectResident: (id: string) => void;
  onClose: () => void;
}

export const ResidentRecordPanel: React.FC<ResidentRecordPanelProps> = ({
  residents,
  selectedResidentId,
  onSelectResident,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const residentList = Object.values(residents);

  // Default to first resident if none selected
  const activeResident = selectedResidentId 
    ? residents[selectedResidentId] 
    : residentList[0];

  const filteredList = residentList.filter(r => 
    r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.sanctuaryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.currentRole.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div role="dialog" aria-modal="true" aria-label="Resident identity archive" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="max-w-4xl w-full h-[85vh] bg-[#0d121a] border-2 border-yellow-500/60 rounded-lg shadow-[0_0_50px_rgba(250,204,21,0.25)] flex flex-col overflow-hidden font-mono-code text-xs relative">
        {/* Header */}
        <div className="bg-[#121824] px-5 py-3 border-b border-[#253245] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users size={16} className="text-yellow-400" />
            <div>
              <span className="font-tech text-yellow-400 font-bold text-sm tracking-widest">
                SANCTUARY ZERO // CITIZEN IDENTITY ARCHIVE
              </span>
              <span className="text-zinc-500 text-[10px] ml-2">
                YELLOW ZONE RESIDENT REGISTRY
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

        {/* Content split: Sidebar List + Detailed Dossier */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: Resident Directory */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[#243042] bg-[#0f141d] p-3 flex flex-col justify-between">
            <div>
              {/* Search input */}
              <div className="relative mb-3">
                <Search size={13} className="absolute left-2.5 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter Sanctuary ID or Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#161d28] border border-[#2b374a] rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
                />
              </div>

              {/* Citizen list */}
              <div className="space-y-1.5 overflow-y-auto max-h-[60vh] pr-1">
                {filteredList.map((r) => {
                  const isSelected = activeResident?.sanctuaryId === r.sanctuaryId;
                  return (
                    <button
                      key={r.sanctuaryId}
                      onClick={() => {
                        sound.playClick();
                        onSelectResident(r.sanctuaryId);
                      }}
                      className={`w-full p-2.5 rounded text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-yellow-500/15 border-yellow-400 text-white'
                          : 'bg-[#131924] border-[#222b3b] hover:border-yellow-500/40 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] mb-0.5">
                        <span className="font-bold text-yellow-400/90">{r.sanctuaryId}</span>
                        <span className="text-zinc-500 uppercase">{r.buildingOrigin}</span>
                      </div>
                      <div className="font-tech font-bold text-sm tracking-wide text-zinc-100">
                        {r.fullName}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                        {r.currentRole}
                      </div>
                      
                      {/* Completeness Bar */}
                      <div className="mt-2 flex items-center justify-between text-[9px]">
                        <span className="text-zinc-500">INTEGRITY:</span>
                        <span className={r.recordCompleteness > 50 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                          {r.recordCompleteness}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-[10px] text-zinc-500 pt-2 border-t border-[#222b3b] text-center">
              5 CITIZENS FLAGGED IN COMMUNITY SECTOR
            </div>
          </div>

          {/* Right: Detailed Recovered Citizen Dossier */}
          {activeResident ? (
            <div className="flex-1 p-6 overflow-y-auto bg-[#0b0e14] space-y-5">
              {/* Profile Card Header */}
              <div className="bg-[#121824] p-5 rounded-lg border border-[#263447] relative">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/30">
                        {activeResident.sanctuaryId}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-red-950/40 text-red-400 border border-red-500/40 font-bold">
                        {activeResident.status}
                      </span>
                    </div>

                    <h2 className="text-2xl font-display font-bold text-white tracking-wide">
                      {activeResident.fullName}
                    </h2>
                    <div className="text-xs text-zinc-300 font-tech mt-1 flex items-center gap-1.5">
                      <Briefcase size={13} className="text-yellow-400" />
                      <span>{activeResident.currentRole}</span>
                    </div>
                  </div>

                  {/* Completeness Gauge */}
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block mb-1">RECORD COMPLETENESS</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-zinc-800 rounded-sm overflow-hidden border border-zinc-700">
                        <div 
                          className="h-full bg-yellow-400"
                          style={{ width: `${activeResident.recordCompleteness}%` }}
                        />
                      </div>
                      <span className="text-yellow-400 font-bold text-sm">
                        {activeResident.recordCompleteness}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between text-[11px] text-zinc-400 gap-2">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-zinc-500" />
                    <span>LAST UPDATE: {activeResident.lastUpdate}</span>
                  </div>
                  <div>
                    <span>ORIGIN FACILITY: </span>
                    <span className="text-yellow-400 font-bold uppercase">{activeResident.buildingOrigin}</span>
                  </div>
                </div>
              </div>

              {/* Housing & Duty Telemetry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-[#121822] p-3.5 rounded border border-[#222c3b]">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] uppercase font-tech mb-1">
                    <Home size={13} className="text-yellow-400" />
                    <span>Housing Status</span>
                  </div>
                  <div className="text-zinc-200 font-semibold">
                    {activeResident.housingStatus}
                  </div>
                </div>

                <div className="bg-[#121822] p-3.5 rounded border border-[#222c3b]">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] uppercase font-tech mb-1">
                    <Calendar size={13} className="text-yellow-400" />
                    <span>Duty Status & Missed Check-Ins</span>
                  </div>
                  <div className="text-amber-400 font-semibold">
                    {activeResident.dutyStatus}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">
                    Missed Check-ins: <span className="text-red-400 font-bold">{activeResident.missedCheckIns}</span>
                  </div>
                </div>
              </div>

              {/* Incident Reports */}
              <div>
                <div className="text-yellow-400 font-tech font-bold uppercase tracking-wider text-xs mb-2 flex items-center gap-1.5">
                  <ShieldAlert size={14} />
                  <span>Sanctuary Security Incident Reports</span>
                </div>
                <div className="space-y-2">
                  {activeResident.incidentReports.map((report, idx) => (
                    <div key={idx} className="bg-[#121721] p-3 rounded border border-zinc-800 text-zinc-300 text-xs leading-relaxed">
                      &bull; {report}
                    </div>
                  ))}
                </div>
              </div>

              {/* System Notes */}
              <div>
                <div className="text-zinc-400 font-tech font-bold uppercase tracking-wider text-xs mb-2 flex items-center gap-1.5">
                  <Cpu size={14} className="text-yellow-400" />
                  <span>MANU Identity Daemon System Notes</span>
                </div>
                <div className="space-y-2">
                  {activeResident.systemNotes.map((note, idx) => (
                    <div key={idx} className="bg-[#0f141d] p-3 rounded border border-[#202938] text-zinc-400 text-xs italic leading-relaxed">
                      "{note}"
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-500 font-tech">
              NO CITIZEN SELECTED
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#10151f] px-5 py-3 border-t border-[#253245] flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            SOLVE CTF TERMINALS IN RELATED COMMUNITY BUILDINGS TO RESTORE CITIZEN DOSSIERS
          </span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded bg-yellow-500 hover:bg-yellow-400 text-black font-tech font-bold text-xs cursor-pointer"
          >
            CLOSE ARCHIVE
          </button>
        </div>
      </div>
    </div>
  );
};
