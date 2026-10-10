import React, { useState } from 'react';
import { BuildingData } from '../types/protocol';
import { BuildingMarker } from './BuildingMarker';
import { sound } from '../utils/sound';
import { Compass, Eye, Wifi, ZoomIn, ZoomOut, Layers3, Map, LocateFixed } from 'lucide-react';

interface CommunityMapProps {
  buildings: BuildingData[];
  selectedBuilding: BuildingData | null;
  onSelectBuilding: (building: BuildingData | null) => void;
  onEnterBuilding: (building: BuildingData) => void;
}

export const CommunityMap: React.FC<CommunityMapProps> = ({
  buildings,
  selectedBuilding,
  onSelectBuilding,
  onEnterBuilding,
}) => {
  const [hoveredBuildingId, setHoveredBuildingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'topdown' | 'isometric'>('topdown');
  const [showConduits, setShowConduits] = useState(false);
  const [showFog, setShowFog] = useState(false);
  const [showCameras, setShowCameras] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoom = (delta: number) => {
    sound.playClick();
    setZoomLevel(prev => Math.min(1.10, Math.max(0.94, Number((prev + delta).toFixed(2)))));
  };

  return (
    <div className="relative w-full h-full flex-1 overflow-hidden bg-[#04070a] select-none flex flex-col map-maze-shell">
      {/* One compact toolbar: keep the opening view quiet and let the maze breathe. */}
      <div className="absolute top-3 left-3 right-3 z-40 flex items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 bg-[#080d12]/90 border border-[#27323b] rounded-md px-2 py-1.5 backdrop-blur-md shadow-lg font-mono-code">
          <div className="flex items-center gap-2 pr-2 border-r border-[#27323b]">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            <span className="hidden sm:inline text-[9px] font-bold tracking-[0.18em] text-zinc-200">YELLOW ZONE</span>
            <span className="text-[8px] text-zinc-600">Y-03</span>
          </div>
          <button
            onClick={() => { sound.playClick(); setViewMode(v => v === 'topdown' ? 'isometric' : 'topdown'); }}
            className={`map-control ${viewMode === 'isometric' ? 'map-control-active' : ''}`}
            title="Switch map projection"
          >
            <Compass size={13} />
            <span className="hidden sm:inline">{viewMode === 'isometric' ? 'ISO' : 'TACTICAL'}</span>
          </button>
          <button onClick={() => { sound.playClick(); setShowCameras(v => !v); }} className={`map-control ${showCameras ? 'map-control-cyan' : ''}`} title="Toggle camera layer">
            <Eye size={12} />
          </button>
          <button onClick={() => { sound.playClick(); setShowConduits(v => !v); }} className={`map-control ${showConduits ? 'map-control-active' : ''}`} title="Toggle infrastructure layer">
            <Wifi size={12} />
          </button>
          <button onClick={() => { sound.playClick(); setShowFog(v => !v); }} className={`map-control ${showFog ? 'map-control-dim' : ''}`} title="Toggle fog">
            <Layers3 size={12} />
          </button>
          <span className="map-divider" />
          <button onClick={() => handleZoom(0.06)} className="map-icon-button" title="Zoom in"><ZoomIn size={14} /></button>
          <button onClick={() => handleZoom(-0.06)} className="map-icon-button" title="Zoom out"><ZoomOut size={14} /></button>
        </div>

        <div className="pointer-events-auto hidden md:flex items-center gap-2 bg-[#080d12]/88 border border-[#27323b] rounded-md px-2.5 py-1.5 backdrop-blur-md font-mono-code">
          <Map size={12} className="text-yellow-400/80" />
          <span className="text-[8px] tracking-[0.15em] text-zinc-500">COMMUNITY GRID</span>
          <span className="text-[8px] text-zinc-700">/</span>
          <span className="text-[8px] text-zinc-300">{buildings.length} NODES</span>
        </div>
      </div>

      {/* Main map only — no side dashboards on entry. */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center px-3 pt-10 pb-11">
        <div
          className="relative w-full max-w-[1180px] aspect-[1200/760] transition-transform duration-300 map-maze-canvas"
          style={{
            transform: viewMode === 'isometric'
              ? `scale(${zoomLevel}) rotateX(18deg) rotateZ(-2deg) translateY(-5px)`
              : `scale(${zoomLevel})`,
            transformStyle: 'preserve-3d'
          }}
        >
          <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 1200 760" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-label="Yellow Zone tactical community map">
            <defs>
              <pattern id="cityGrid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#1b2a32" strokeWidth="0.7"/><circle cx="12" cy="12" r="0.8" fill="#36505a" opacity=".5"/></pattern>
              <pattern id="microGrid" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M6 0H0V6" fill="none" stroke="#16232a" strokeWidth=".35"/></pattern>
              <pattern id="roadDash" width="28" height="8" patternUnits="userSpaceOnUse"><path d="M0 4H14" stroke="#d5b95a" strokeWidth="1.2" opacity=".55"/></pattern>
              <pattern id="warningStripe" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="12" height="12" fill="#12191d"/><rect width="4" height="12" fill="#eab308" opacity=".65"/></pattern>
              <linearGradient id="ground" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#101b20"/><stop offset=".52" stopColor="#071014"/><stop offset="1" stopColor="#030608"/></linearGradient>
              <linearGradient id="roadSurface" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#243239"/><stop offset="1" stopColor="#10191e"/></linearGradient>
              <linearGradient id="buildingTop" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#273941"/><stop offset="1" stopColor="#111d22"/></linearGradient>
              <linearGradient id="buildingSide" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#18272d"/><stop offset="1" stopColor="#080e12"/></linearGradient>
              <radialGradient id="hubGlow"><stop offset="0" stopColor="#facc15" stopOpacity=".22"/><stop offset="1" stopColor="#facc15" stopOpacity="0"/></radialGradient>
              <radialGradient id="cyanGlow"><stop offset="0" stopColor="#22d3ee" stopOpacity=".17"/><stop offset="1" stopColor="#22d3ee" stopOpacity="0"/></radialGradient>
              <filter id="shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#000" floodOpacity=".8"/></filter>
              <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            {/* Ground plane and survey grid */}
            <rect width="1200" height="760" fill="url(#ground)"/><rect x="28" y="28" width="1144" height="704" fill="url(#cityGrid)" opacity=".62"/><rect x="42" y="42" width="1116" height="676" fill="url(#microGrid)" opacity=".14"/>
            <ellipse cx="585" cy="378" rx="520" ry="360" fill="url(#cyanGlow)"/>
            {/* District zoning */}
            <g fill="none" stroke="#31434b" strokeWidth="1" strokeDasharray="3 8" opacity=".24"><path d="M405 58V704M790 58V704M58 278H1142M58 520H1142"/></g>
            {/* Heavy perimeter with access notches */}
            <rect x="55" y="55" width="1090" height="650" rx="8" fill="none" stroke="#020405" strokeWidth="24"/><rect x="55" y="55" width="1090" height="650" rx="8" fill="none" stroke="#3b515a" strokeWidth="5"/><rect x="62" y="62" width="1076" height="636" rx="5" fill="none" stroke="#78909a" strokeWidth=".8" strokeDasharray="2 10" opacity=".7"/>
            {/* Streets: broad arterial roads and smaller service lanes */}
            <g fill="none" strokeLinecap="square">
              <path d="M76 426H144L144 182H264H552V365H936V182H1090" stroke="#05090b" strokeWidth="52"/><path d="M144 426H310V590H552V365H760V486H984V620" stroke="#05090b" strokeWidth="46"/><path d="M264 182V126H552V230H740V182H936" stroke="#05090b" strokeWidth="34"/><path d="M552 365H610V490H760" stroke="#05090b" strokeWidth="32"/>
              <path d="M76 426H144L144 182H264H552V365H936V182H1090" stroke="url(#roadSurface)" strokeWidth="44"/><path d="M144 426H310V590H552V365H760V486H984V620" stroke="url(#roadSurface)" strokeWidth="38"/><path d="M264 182V126H552V230H740V182H936" stroke="url(#roadSurface)" strokeWidth="27"/><path d="M552 365H610V490H760" stroke="url(#roadSurface)" strokeWidth="25"/>
              <path d="M76 426H144L144 182H264H552V365H936V182H1090M144 426H310V590H552V365H760V486H984V620M264 182V126H552V230H740V182H936M552 365H610V490H760" stroke="url(#roadDash)" strokeWidth="2" opacity=".95"/>
              <path d="M76 404H125V158H284M286 204H528V250H718V204H916M574 387H918V464H960M332 568V612H532M780 508H1006V642" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 7" opacity={showConduits ? .6 : 0}/>
            </g>
            {/* Street islands, barriers and identifiable intersections */}
            <g filter="url(#shadow)">
              <g fill="#101a1f" stroke="#40545d" strokeWidth="1.5"><rect x="185" y="304" width="72" height="38" rx="4"/><rect x="374" y="306" width="96" height="34" rx="4"/><rect x="674" y="300" width="76" height="36" rx="4"/><rect x="828" y="302" width="58" height="30" rx="4"/><rect x="342" y="450" width="78" height="36" rx="4"/><rect x="648" y="548" width="82" height="38" rx="4"/><rect x="844" y="574" width="68" height="34" rx="4"/></g>
              <g fill="#233840" opacity=".8"><rect x="196" y="314" width="50" height="3"/><rect x="196" y="324" width="36" height="3"/><rect x="386" y="316" width="70" height="3"/><rect x="386" y="326" width="42" height="3"/><rect x="686" y="310" width="50" height="3"/><rect x="686" y="320" width="34" height="3"/><rect x="353" y="460" width="56" height="3"/><rect x="660" y="558" width="58" height="3"/></g>
            </g>
            {/* Sports Complex campus — south-west: arena court and training annex */}
            <g transform="translate(144 426)" filter="url(#shadow)"><path d="M-72-54L-54-76H54L72-54V54L54 76H-54L-72 54Z" fill="#111c20" stroke="#f97316" strokeWidth="2"/><path d="M-60-46L-44-62H44L60-46V46L44 62H-44L-60 46Z" fill="url(#buildingTop)" stroke="#5d6f75"/><path d="M-44-48H44V48H-44Z" fill="#10191e" stroke="#f97316" strokeWidth="1.5"/><path d="M-44 0H44M0-48V48" stroke="#f97316" strokeWidth="1.3" opacity=".8"/><circle r="15" fill="none" stroke="#f97316" strokeWidth="1.5"/><circle r="3" fill="#f97316" filter="url(#glow)"/><path d="M-42-35H-22V-15H-42ZM22 15H42V35H22Z" fill="#f97316" opacity=".22"/><path d="M-60-65H60M-60 65H60" stroke="#fdba74" strokeWidth="3"/><text x="0" y="91" fill="#fdba74" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono" letterSpacing="1.2">SPORTS COMPLEX / ATH-Y04</text></g>
            {/* Hospital campus — north-west */}
            <g transform="translate(264 182)" filter="url(#shadow)"><path d="M-66-42H-26V-62H26V-42H66V42H-66Z" fill="url(#buildingTop)" stroke="#2dd4bf" strokeWidth="2"/><path d="M-55-31H55V31H-55Z" fill="#102329" stroke="#3a6668"/><path d="M-12-25H12V-8H29V8H12V25H-12V8H-29V-8H-12Z" fill="#2dd4bf" opacity=".75"/><path d="M-45-49H-31M31-49H45M-45 43H45" stroke="#a5f3fc" strokeWidth="2"/><text x="0" y="58" fill="#99f6e4" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono" letterSpacing="1.2">HOSPITAL / MED-Y01</text></g>
            {/* School campus — north-east */}
            <g transform="translate(936 182)" filter="url(#shadow)"><path d="M-72-42L-48-62H48L72-42V42H-72Z" fill="url(#buildingTop)" stroke="#38bdf8" strokeWidth="2"/><path d="M-58-29H58V29H-58Z" fill="#0d202a" stroke="#31627a"/><path d="M-44-16H44M-44 0H44M-44 16H44" stroke="#38bdf8" strokeWidth="2" opacity=".7"/><path d="M-28-27V27M0-27V27M28-27V27" stroke="#38bdf8" strokeWidth="1" opacity=".4"/><text x="0" y="58" fill="#7dd3fc" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono" letterSpacing="1.2">SCHOOL / EDU-Y02</text></g>
            {/* Residential society — central habitat cluster */}
            <g transform="translate(552 365)" filter="url(#shadow)"><path d="M-78-48L-58-66H58L78-48V48L58 66H-58L-78 48Z" fill="url(#buildingTop)" stroke="#e879f9" strokeWidth="2"/><path d="M-61-36H-10V-8H-61ZM10-36H61V-8H10ZM-61 8H-10V36H-61ZM10 8H61V36H10Z" fill="#24142b" stroke="#a855f7"/><g fill="#e879f9"><rect x="-49" y="-27" width="8" height="8"/><rect x="-30" y="-27" width="8" height="8"/><rect x="22" y="-27" width="8" height="8"/><rect x="41" y="-27" width="8" height="8"/><rect x="-49" y="17" width="8" height="8"/><rect x="-30" y="17" width="8" height="8"/><rect x="22" y="17" width="8" height="8"/><rect x="41" y="17" width="8" height="8"/></g><text x="0" y="86" fill="#f0abfc" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono" letterSpacing="1.2">SOCIETY / RES-Y05</text></g>
            {/* Museum archive — south-east */}
            <g transform="translate(984 486)" filter="url(#shadow)"><path d="M-72-45L0-68L72-45V45L0 68L-72 45Z" fill="url(#buildingTop)" stroke="#facc15" strokeWidth="2"/><path d="M-53-33L0-50L53-33V33L0 50L-53 33Z" fill="#241e10" stroke="#a88731"/><path d="M-34-20L0-31L34-20V20L0 31L-34 20Z" fill="none" stroke="#facc15" strokeWidth="1.5"/><circle r="10" fill="#facc15" opacity=".25"/><circle r="3" fill="#facc15" filter="url(#glow)"/><text x="0" y="84" fill="#fde68a" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono" letterSpacing="1.2">MUSEUM / ARC-Y03</text></g>
            {/* Small urban blocks give the district depth without obscuring the roads */}
            <g filter="url(#shadow)" fill="url(#buildingTop)" stroke="#344a53" strokeWidth="1.3">
              <path d="M86 108H162V146H86Z M86 108L98 96H174L162 108Z M162 108L174 96V134L162 146Z"/><path d="M340 105H400V145H340Z M340 105L352 93H412L400 105Z M400 105L412 93V133L400 145Z"/>
              <path d="M780 105H842V145H780Z M780 105L792 93H854L842 105Z M842 105L854 93V133L842 145Z"/><path d="M1040 260H1100V302H1040Z M1040 260L1052 248H1112L1100 260Z M1100 260L1112 248V290L1100 302Z"/>
              <path d="M88 550H132V596H88Z M88 550L100 538H144L132 550Z M132 550L144 538V584L132 596Z"/><path d="M240 620H296V660H240Z M240 620L252 608H308L296 620Z M296 620L308 608V648L296 660Z"/>
              <path d="M422 612H476V656H422Z M422 612L434 600H488L476 612Z M476 612L488 600V644L476 656Z"/><path d="M804 620H858V660H804Z M804 620L816 608H870L858 620Z M858 620L870 608V648L858 660Z"/>
            </g>
            <g stroke="#58717b" strokeWidth="1" opacity=".75"><path d="M96 120H152M96 130H152M350 117H390M350 127H390M790 117H832M790 127H832M1050 273H1090M1050 283H1090M248 632H288M430 624H468M812 632H850"/></g>
            {/* Central civic plaza and route diagnostics */}
            <g transform="translate(610 490)"><circle r="70" fill="url(#hubGlow)"/><circle r="42" fill="#0b151a" stroke="#536871" strokeWidth="1.5"/><circle r="31" fill="none" stroke="#facc15" strokeDasharray="3 5" opacity=".8"/><circle r="19" fill="#111d22" stroke="#22d3ee"/><path d="M-13 0H13M0-13V13" stroke="#e2e8f0" strokeWidth="1.2"/><circle r="4" fill="#facc15" filter="url(#glow)"/><text y="58" textAnchor="middle" fill="#c5d2d8" fontSize="7" fontFamily="JetBrains Mono" letterSpacing="1.2">CENTRAL EXCHANGE</text><text y="69" textAnchor="middle" fill="#71858e" fontSize="6" fontFamily="JetBrains Mono">ROUTE NODE C-00</text></g>
            {/* Route connections and entry beacon */}
            <g fill="none" stroke="#facc15" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity=".55"><path d="M144 426L144 182L264 182"/><path d="M264 182H552V365H936V182"/><path d="M552 365L552 590H310V426H144"/><path d="M936 182H1080V486H984"/><path d="M552 365L610 490L760 490L984 486"/></g>
            <g fill="#facc15" filter="url(#glow)"><circle cx="144" cy="426" r="3.5"/><circle cx="264" cy="182" r="3.5"/><circle cx="552" cy="365" r="3.5"/><circle cx="936" cy="182" r="3.5"/><circle cx="984" cy="486" r="3.5"/></g>
            {/* Camera layer */}
            {showCameras && <g fontFamily="JetBrains Mono, monospace" fontSize="7" fill="#67e8f9"><g transform="translate(200 246)"><circle r="5" fill="#071217" stroke="#22d3ee"/><circle r="1.5" fill="#22d3ee"/><path d="M0 0L35 18" stroke="#22d3ee" opacity=".4"/><text x="9" y="-8">CAM-02</text></g><g transform="translate(480 365)"><circle r="5" fill="#071217" stroke="#22d3ee"/><circle r="1.5" fill="#22d3ee"/><path d="M0 0L-18 28" stroke="#22d3ee" opacity=".4"/><text x="8" y="-8">CAM-05</text></g><g transform="translate(818 182)"><circle r="5" fill="#071217" stroke="#22d3ee"/><circle r="1.5" fill="#22d3ee"/><path d="M0 0L-22 20" stroke="#22d3ee" opacity=".4"/><text x="8" y="-8">CAM-07</text></g><g transform="translate(850 486)"><circle r="5" fill="#071217" stroke="#22d3ee"/><circle r="1.5" fill="#22d3ee"/><path d="M0 0L-18-22" stroke="#22d3ee" opacity=".4"/><text x="8" y="-8">CAM-10</text></g></g>}
            {/* Controlled hazard zones and access gates */}
            <g fontFamily="JetBrains Mono, monospace" fontSize="7" letterSpacing=".8"><g transform="translate(144 358)"><rect x="-22" y="-8" width="44" height="16" rx="2" fill="#0a1115" stroke="#f97316"/><text y="3" textAnchor="middle" fill="#fdba74">GATE A-4</text></g><g transform="translate(760 365)"><rect x="-26" y="-8" width="52" height="16" rx="2" fill="#0a1115" stroke="#64748b"/><text y="3" textAnchor="middle" fill="#94a3b8">GATE C-19</text></g><g transform="translate(552 548)"><rect x="-27" y="-8" width="54" height="16" rx="2" fill="#0a1115" stroke="#64748b"/><text y="3" textAnchor="middle" fill="#94a3b8">SERVICE-31</text></g></g>
            <g fill="url(#warningStripe)" opacity=".8"><rect x="70" y="67" width="110" height="6"/><rect x="1020" y="67" width="110" height="6"/><rect x="70" y="687" width="110" height="6"/><rect x="1020" y="687" width="110" height="6"/></g>
            {/* Entry / north arrow / diagnostic overlays */}
            <g transform="translate(92 178)"><circle r="17" fill="#081217" stroke="#facc15" strokeWidth="1.4"/><circle r="9" fill="none" stroke="#facc15" strokeDasharray="2 3"/><path d="M0-7V7M-7 0H7" stroke="#facc15"/><text x="-3" y="29" fill="#fde68a" fontSize="7" fontFamily="JetBrains Mono" letterSpacing="1">ENTRY</text></g>
            <g transform="translate(1090 118)"><circle r="27" fill="#081116" stroke="#3e555f"/><circle r="20" fill="none" stroke="#29404a" strokeDasharray="2 4"/><path d="M0-17L6 5L0 1L-6 5Z" fill="#facc15"/><text y="37" textAnchor="middle" fill="#9ab0ba" fontSize="7" fontFamily="JetBrains Mono">NORTH</text></g>
            {showFog && <g pointerEvents="none"><ellipse cx="300" cy="330" rx="190" ry="88" fill="url(#cyanGlow)" opacity=".38"/><ellipse cx="810" cy="565" rx="250" ry="100" fill="url(#hubGlow)" opacity=".28"/></g>}
            <g fill="#78909a" fontFamily="JetBrains Mono, monospace" fontSize="6.5" letterSpacing=".5"><text x="72" y="716">YELLOW ZONE / Y-03 // VISIBILITY 42M // ROUTE ENGINE ONLINE</text><text x="1128" y="716" textAnchor="end">5 NODES // 4 GATES // DIAGNOSTICS READY</text><text x="322" y="258" fill="#3f5862" opacity=".75">MEDICAL ACCESS LANE</text><text x="650" y="146" fill="#3f5862" opacity=".75">ELEVATED SERVICE SPINE</text><text x="825" y="535" fill="#3f5862" opacity=".75">ARCHIVE APPROACH</text></g>
            <rect x="55" y="55" width="1090" height="650" rx="8" fill="none" stroke="#22d3ee" strokeWidth="1" opacity=".2"/>
          </svg>

          {buildings.map((building) => (
            <BuildingMarker
              key={building.id}
              building={building}
              isHovered={hoveredBuildingId === building.id}
              isSelected={selectedBuilding?.id === building.id}
              onHover={setHoveredBuildingId}
              onSelect={onSelectBuilding}
              onEnter={onEnterBuilding}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 pointer-events-none font-mono-code">
        <div className="map-minimal-legend">
          <span><LocateFixed size={11} className="text-yellow-400" /> ENTRY</span>
          <span>5 BUILDINGS</span>
          <span>INTERCONNECTED MAZE</span>
          <span className="text-cyan-300/80">Y-03</span>
        </div>
      </div>
    </div>
  );
};
