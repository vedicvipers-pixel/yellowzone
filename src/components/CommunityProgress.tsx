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
  const totalPossible = buildings.length;
  const progressPercent = 100;
  const routeOrder = ['hospital', 'school', 'museum', 'sports', 'society'];
  const routeStory: Record<string, { step: string; trail: string }> = {
    hospital: { step: 'The erased intake', trail: 'A paper record contradicts the public ward status.' },
    school: { step: 'The missing roster', trail: 'An older export preserves rows removed by a refresh.' },
    museum: { step: 'The altered exhibit', trail: 'An original image conflicts with the public catalog.' },
    sports: { step: 'The delayed replay', trail: 'Raw timing differs from the published sequence.' },
    society: { step: 'The hidden address', trail: 'A physical unit and retained rows are absent from the public index.' },
  };
  const orderedBuildings = [...buildings].sort((a, b) => routeOrder.indexOf(a.id) - routeOrder.indexOf(b.id));

  return (
    <div className="bg-[#10141b]/90 border border-[#232d3d] p-3 rounded shadow-lg backdrop-blur-md font-mono-code text-xs w-full max-w-xs select-none">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#232d3d] pb-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <Database size={13} className="text-yellow-400" />
          <span className="font-display font-bold text-yellow-400 text-xs tracking-wider">
            TRACE NETWORK
          </span>
        </div>
        <span className="text-[10px] text-zinc-400 font-tech">SECTOR // YELLOW</span>
      </div>

      <div className="mb-3 rounded border border-yellow-500/25 bg-yellow-500/5 p-2.5">
        <div className="mb-1 text-[9px] font-bold tracking-[0.18em] text-yellow-300">THE MISSING DATASET</div>
        <p className="text-[10px] leading-relaxed text-zinc-300">Five records appear unrelated until their versions are compared. Follow the numbered trace from a disputed hospital intake to a residential source the public map denies exists.</p>
      </div>

      {/* Buildings List: sorted in the intended narrative route */}
      <div className="space-y-1.5 mb-3">
        {orderedBuildings.map(b => {
          const isCurrent = activeBuildingId === b.id;

          const badgeColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
          const statusDot = 'bg-emerald-400';

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
                <span className="grid h-5 w-5 place-items-center rounded border border-yellow-500/40 bg-yellow-500/10 text-[9px] font-black text-yellow-300">{String(routeOrder.indexOf(b.id) + 1).padStart(2, '0')}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                <div className="min-w-0"><span className="block font-tech text-xs tracking-wider uppercase group-hover:text-yellow-300 transition-colors">
                  {b.name.replace('PLAYGROUND / CLUB / ', '')}
                </span><span className="mt-0.5 block truncate text-[9px] font-normal text-zinc-500">{routeStory[b.id]?.step}</span></div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[11px] px-1.5 py-0.2 rounded border font-mono-code font-bold ${badgeColor}`}>
                  ONLINE
                </span>
                <ChevronRight size={12} className="text-zinc-600 group-hover:text-yellow-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          );
        })}
      </div>

      {activeBuildingId && routeStory[activeBuildingId] && <div className="mb-3 rounded border border-cyan-900/50 bg-cyan-950/15 p-2.5"><div className="text-[9px] font-bold tracking-widest text-cyan-300">ACTIVE TRACE</div><div className="mt-1 text-[10px] font-bold text-zinc-200">{routeStory[activeBuildingId].step}</div><p className="mt-1 text-[10px] leading-relaxed text-zinc-400">{routeStory[activeBuildingId].trail}</p></div>}

      {/* Total Progress */}
      <div className="border-t border-[#232d3d] pt-2">
        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
          <span className="font-tech tracking-wider text-zinc-300">BUILDINGS LINKED</span>
          <span className="font-mono-code text-emerald-400">
            {totalPossible}/{totalPossible}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#171f2b] rounded-full overflow-hidden border border-[#2b3545]">
          <div 
            className="h-full transition-all duration-500 bg-emerald-400"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-1 font-mono-code">
          <span>SOCIAL MIRROR</span>
          <span>{progressPercent}% AVAILABLE</span>
        </div>
      </div>
    </div>
  );
};
