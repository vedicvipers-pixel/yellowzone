import React from 'react';
import { BuildingData } from '../types/protocol';
import { sound } from '../utils/sound';
import { 
  X, 
  LogIn, 
  Activity, 
  ShieldAlert, 
  Terminal, 
  CheckCircle2, 
  CircleDot,
  FileText
} from 'lucide-react';

interface BuildingPanelProps {
  building: BuildingData | null;
  onClose: () => void;
  onEnter: (building: BuildingData) => void;
  onOpenResidentDossier?: (residentId: string) => void;
}

export const BuildingPanel: React.FC<BuildingPanelProps> = ({
  building,
  onClose,
  onEnter,
  onOpenResidentDossier
}) => {
  if (!building) return null;

  const visibleCtfs = building.ctfs.slice(0, 1);
  const solvedCount = visibleCtfs.filter(c => c.completed).length;

  return (
    <aside className="absolute inset-y-0 right-0 w-80 max-w-[92vw] lg:w-96 overflow-y-auto bg-[#0f141d]/95 border-l border-[#273244] p-4 flex flex-col justify-between h-full backdrop-blur-md font-mono-code text-xs select-none shadow-2xl z-40">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between border-b border-[#243042] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
            <span className="font-tech text-yellow-400 font-bold tracking-widest text-sm">
              FACILITY TELEMETRY
            </span>
          </div>

          <button
            type="button"
            aria-label={`Close ${building.name} inspection panel`}
            title="Close building details"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded hover:bg-[#1a2332] text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Building Title & Code */}
        <div className="bg-[#141b25] p-3 rounded border border-[#2b374a] mb-4">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
            <span className="font-bold text-yellow-400/90">{building.code}</span>
            <span className="text-zinc-500">ZONE: COMMUNITY-Y</span>
          </div>
          <h2 className="font-display font-bold text-xl text-white tracking-wide">
            {building.name}
          </h2>
          <div className="text-zinc-400 text-xs font-tech mt-0.5">
            {building.sectorTitle}
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-800 text-[11px]">
            <span className="text-zinc-400">STATUS:</span>
            <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 font-bold border border-yellow-500/30">
              {building.status}
            </span>
          </div>
        </div>

        {/* Short & Lore Descriptions */}
        <div className="space-y-3 mb-4">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 font-tech">
              Sector Overview
            </div>
            <p className="text-zinc-300 leading-relaxed text-[11px] bg-[#0c1017] p-2.5 rounded border border-[#1e2634]">
              {building.shortDescription}
            </p>
          </div>

          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 font-tech">
              MANU Sensor Intercept
            </div>
            <p className="text-zinc-400 leading-relaxed text-[10px] italic border-l-2 border-yellow-500/50 pl-2">
              "{building.loreDescription}"
            </p>
          </div>
        </div>

        {/* CTF Terminal Nodes Summary */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 font-tech">
            <span>Terminal Intercept Points</span>
            <span className="text-yellow-400 font-mono-code font-bold">{solvedCount}/1 Solved</span>
          </div>

          <div className="space-y-2">
            {visibleCtfs.map((ctf) => (
              <div
                key={ctf.id}
                className={`p-2 rounded border flex items-center justify-between ${
                  ctf.completed
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-[#141b25] border-[#253245] text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {ctf.completed ? (
                    <CheckCircle2 size={14} className="text-emerald-400" />
                  ) : (
                    <CircleDot size={14} className="text-yellow-400 animate-pulse" />
                  )}
                  <div>
                    <div className="font-tech font-bold text-xs tracking-wider">
                      {ctf.label}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      CTF // {ctf.slot} &bull; {ctf.subtitle}
                    </div>
                  </div>
                </div>

                <span className={`text-[9px] px-1 py-0.5 rounded font-mono-code ${
                  ctf.completed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {ctf.completed ? 'SECURED' : 'LOCKED'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Associated Resident Link */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenResidentDossier && onOpenResidentDossier(building.residentId);
          }}
          className="w-full flex items-center justify-between p-2 rounded border border-[#2b3749] bg-[#121822] hover:border-yellow-500/50 hover:bg-[#18212e] text-zinc-300 transition-colors cursor-pointer group text-[11px]"
        >
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-yellow-400 group-hover:scale-110 transition-transform" />
            <span className="font-tech">INSPECT SECTOR RESIDENT DOSSIER</span>
          </div>
          <span className="text-yellow-400 font-mono-code text-[10px]">&rarr;</span>
        </button>
      </div>

      {/* Bottom CTA to Enter Building Room */}
      <div className="pt-4 border-t border-[#243042]">
        <button
          onClick={() => {
            sound.playAirlock();
            onEnter(building);
          }}
          className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 active:scale-[0.99] text-black font-tech font-bold text-sm tracking-widest rounded flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(250,204,21,0.4)] transition-all"
        >
          <LogIn size={16} />
          <span>[ ENTER ENTRANCE ROOM ]</span>
        </button>
        <div className="text-center text-[10px] text-zinc-500 mt-2 font-mono-code">
          TRANSITIONS TO FIRST-PERSON 3D INTERIOR
        </div>
      </div>
    </aside>
  );
};
