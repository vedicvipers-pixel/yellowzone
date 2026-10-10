import React from 'react';
import { BuildingData, BuildingId } from '../types/protocol';
import { ShieldCheck, AlertCircle, Database, ChevronRight } from 'lucide-react';
import { sound } from '../utils/sound';

interface CommunityProgressProps {
  buildings: BuildingData[];
  onSelectBuilding?: (id: BuildingId) => void;
  activeBuildingId?: BuildingId;
}

export const CommunityProgress: React.FC<CommunityProgressProps> = ({
  buildings,
  onSelectBuilding,
  activeBuildingId
}) => {
  const totalSolved = buildings.reduce((acc, b) => {
    return acc + b.ctfs.slice(0, 1).filter(c => c.completed).length;
  }, 0);
  const totalPossible = buildings.length;
  const progressPercent = Math.round((totalSolved / totalPossible) * 100);

  return (
    <div className="bg-[#10141b]/90 border border-[#232d3d] p-3 rounded shadow-lg backdrop-blur-md font-mono-code text-xs w-full max-w-xs select-none">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#232d3d] pb-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <Database size={13} className="text-yellow-400" />
          <span className="font-display font-bold text-yellow-400 text-xs tracking-wider">
            COMMUNITY STATUS
          </span>
        </div>
        <span className="text-[10px] text-zinc-400 font-tech">SECTOR // YELLOW</span>
      </div>

      {/* Buildings List */}
      <div className="space-y-1.5 mb-3">
        {buildings.map(b => {
          const visibleCtfs = b.ctfs.slice(0, 1);
          const solvedCount = visibleCtfs.filter(c => c.completed).length;
          const isComplete = solvedCount === 1;
          const isPartial = solvedCount === 1;
          const isCurrent = activeBuildingId === b.id;

          let badgeColor = 'text-zinc-500 bg-zinc-900 border-zinc-800';
          let statusDot = 'bg-zinc-600';
          if (isComplete) {
            badgeColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
            statusDot = 'bg-emerald-400';
          } else if (isPartial) {
            badgeColor = 'text-yellow-400 bg-yellow-950/40 border-yellow-800/60';
            statusDot = 'bg-yellow-400 animate-pulse';
          }

          return (
            <button
              key={b.id}
              onClick={() => {
                sound.playClick();
                onSelectBuilding && onSelectBuilding(b.id);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded border transition-all text-left group cursor-pointer ${
                isCurrent 
                  ? 'border-yellow-500 bg-yellow-500/10 text-white' 
                  : 'border-[#1e2633] bg-[#131922]/80 hover:border-yellow-500/40 hover:bg-[#18202b] text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                <span className="font-tech text-xs tracking-wider uppercase group-hover:text-yellow-300 transition-colors">
                  {b.name.replace('PLAYGROUND / CLUB / ', '')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[11px] px-1.5 py-0.2 rounded border font-mono-code font-bold ${badgeColor}`}>
                  {solvedCount}/1
                </span>
                <ChevronRight size={12} className="text-zinc-600 group-hover:text-yellow-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Total Progress */}
      <div className="border-t border-[#232d3d] pt-2">
        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
          <span className="font-tech tracking-wider text-zinc-300">TOTAL CTF RECOVERY</span>
          <span className={`font-mono-code ${totalSolved === totalPossible ? 'text-emerald-400' : 'text-yellow-400'}`}>
            {totalSolved}/{totalPossible}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#171f2b] rounded-full overflow-hidden border border-[#2b3545]">
          <div 
            className={`h-full transition-all duration-500 ${
              totalSolved === totalPossible ? 'bg-emerald-400' : 'bg-yellow-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-1 font-mono-code">
          <span>IDENTITY BUFFER</span>
          <span>{progressPercent}% SECURED</span>
        </div>
      </div>
    </div>
  );
};
