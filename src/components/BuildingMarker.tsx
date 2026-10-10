import React from 'react';
import { BuildingData } from '../types/protocol';
import { sound } from '../utils/sound';
import { 
  Cross, 
  GraduationCap, 
  Landmark, 
  Dumbbell, 
  Home,
  CheckCircle2,
  LogIn
} from 'lucide-react';

interface BuildingMarkerProps {
  building: BuildingData;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (id: string | null) => void;
  onSelect: (building: BuildingData) => void;
  onEnter: (building: BuildingData) => void;
}

export const BuildingMarker: React.FC<BuildingMarkerProps> = ({
  building,
  isHovered,
  isSelected,
  onHover,
  onSelect,
  onEnter
}) => {
  const visibleCtfs = building.ctfs.slice(0, 1);
  const solvedCount = visibleCtfs.filter(c => c.completed).length;
  const isComplete = solvedCount === 1;

  // Themed visual styling for each small node
  const getBuildingAccent = () => {
    switch (building.id) {
      case 'hospital':
        return {
          icon: <Cross size={15} className="text-teal-400" />,
          nodeBorder: 'border-teal-400 shadow-[0_0_18px_rgba(20,184,166,0.6)] bg-[#091b22]',
          ringColor: '#14b8a6',
          titleColor: 'text-teal-300',
          badgeColor: 'text-teal-400 bg-teal-950/80 border-teal-500/50'
        };
      case 'school':
        return {
          icon: <GraduationCap size={15} className="text-sky-400" />,
          nodeBorder: 'border-sky-400 shadow-[0_0_18px_rgba(56,189,248,0.6)] bg-[#0d1a29]',
          ringColor: '#38bdf8',
          titleColor: 'text-sky-300',
          badgeColor: 'text-sky-400 bg-sky-950/80 border-sky-500/50'
        };
      case 'museum':
        return {
          icon: <Landmark size={15} className="text-amber-400" />,
          nodeBorder: 'border-amber-400 shadow-[0_0_18px_rgba(250,204,21,0.6)] bg-[#1c1329]',
          ringColor: '#facc15',
          titleColor: 'text-amber-300',
          badgeColor: 'text-amber-400 bg-amber-950/80 border-amber-500/50'
        };
      case 'sports':
        return {
          icon: <Dumbbell size={15} className="text-orange-400" />,
          nodeBorder: 'border-orange-400 shadow-[0_0_18px_rgba(249,115,22,0.6)] bg-[#24130b]',
          ringColor: '#f97316',
          titleColor: 'text-orange-300',
          badgeColor: 'text-orange-400 bg-orange-950/80 border-orange-500/50'
        };
      case 'society':
        return {
          icon: <Home size={15} className="text-fuchsia-400" />,
          nodeBorder: 'border-fuchsia-400 shadow-[0_0_18px_rgba(217,70,239,0.6)] bg-[#210d29]',
          ringColor: '#d946ef',
          titleColor: 'text-fuchsia-300',
          badgeColor: 'text-fuchsia-400 bg-fuchsia-950/80 border-fuchsia-500/50'
        };
    }
  };

  const accent = getBuildingAccent();
  // The inspection drawer becomes the primary detail surface after selection.
  // Keep hover tooltips only for unselected nodes to avoid stacked duplicate panels.
  const showTooltip = isHovered && !isSelected;

  return (
    <div
      style={{
        left: `${building.gridPos.x}%`,
        top: `${building.gridPos.y}%`,
      }}
      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 font-mono-code select-none"
      onMouseEnter={() => {
        sound.playHover();
        onHover(building.id);
      }}
      onMouseLeave={() => onHover(null)}
      onClick={() => {
        sound.playClick();
        onSelect(building);
      }}
    >
      {/* ========================================================= */}
      {/* THE SMALL NODE (Scales up subtly on hover, not overly large) */}
      {/* ========================================================= */}
      <div 
        className={`relative flex items-center justify-center transition-all duration-200 ease-out ${
          isHovered || isSelected ? 'scale-[1.08] z-30' : 'scale-100'
        }`}
      >
        {/* Pulsing Outer Radar Ring */}
        <div 
          className={`absolute -inset-1.5 rounded-full border transition-all duration-200 pointer-events-none ${
            isHovered ? 'opacity-80' : 'opacity-35'
          }`}
          style={{ borderColor: accent.ringColor }}
        />

        {/* Small Node Core Circle (50px diameter) */}
        <div 
          className={`w-10 h-10 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200 backdrop-blur-md ${accent.nodeBorder} ${
            isSelected ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-black' : ''
          }`}
        >
          {accent.icon}
        </div>

        {/* Completed status checkmark badge */}
        {isComplete && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-black flex items-center justify-center text-black">
            <CheckCircle2 size={11} className="stroke-[3]" />
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* COMPACT PERMANENT LABEL TAG BELOW THE NODE */}
      {/* ========================================================= */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 flex flex-col items-center pointer-events-none whitespace-nowrap">
        <div className={`px-1.5 py-0.5 rounded text-[8px] font-tech font-bold uppercase tracking-[0.08em] border shadow-md ${
          isHovered ? 'bg-[#182333] text-white border-yellow-400' : 'bg-[#0b1017]/90 text-zinc-300 border-[#1f2d3f]'
        }`}>
          {building.id === 'society' ? 'SOCIETY' : building.id === 'sports' ? 'SPORTS COMPLEX' : building.name}
        </div>
        {isHovered && (
          <div className="text-[7px] text-zinc-500 mt-0.5 font-bold">{solvedCount}/1 CTF</div>
        )}
      </div>

      {/* ========================================================= */}
      {/* COMPACT HOVER TOOLTIP / ACTION POPOVER (Appears on hover) */}
      {/* ========================================================= */}
      {showTooltip && (
        <div 
          className={`absolute ${building.gridPos.y <= 30 ? 'top-full mt-3' : 'bottom-full mb-3'} left-1/2 -translate-x-1/2 w-56 bg-[#0c121b]/95 border border-yellow-400/80 p-3 rounded-lg shadow-[0_0_25px_rgba(0,0,0,0.9)] z-50 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-1.5">
            <div className={`font-tech font-bold text-xs ${accent.titleColor}`}>
              {building.name}
            </div>
            <span className="text-[9px] text-zinc-400 font-mono-code">
              {building.code}
            </span>
          </div>

          {/* Short Description */}
          <p className="text-[10px] text-zinc-300 line-clamp-2 leading-relaxed mb-2 font-mono-code">
            {building.shortDescription}
          </p>

          {/* Status & CTF Count */}
          <div className="flex items-center justify-between text-[9px] mb-2 font-mono-code">
            <span className="text-zinc-500">STATUS:</span>
            <span className="text-yellow-300 font-semibold">{building.status}</span>
          </div>

          {/* Enter Action Button */}
          <button
            onClick={() => {
              sound.playAirlock();
              onEnter(building);
            }}
            className="w-full py-1.5 rounded bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black font-tech font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
          >
            <LogIn size={12} />
            <span>[ ENTER ROOM ]</span>
          </button>
        </div>
      )}
    </div>
  );
};
