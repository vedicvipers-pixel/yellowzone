import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Terminal, 
  Users, 
  RotateCcw, 
  Tv, 
  Activity,
  Layers,
  HelpCircle
} from 'lucide-react';
import { sound } from '../utils/sound';

interface SystemHeaderProps {
  totalSolved: number;
  totalCtfs: number;
  onOpenResidents: () => void;
  onOpenLogs: () => void;
  onReset: () => void;
  onToggleCrt: () => void;
  crtEnabled: boolean;
  activeBuildingName?: string;
  onReturnToMap?: () => void;
  onReturnToGate?: () => void;
}

export const SystemHeader: React.FC<SystemHeaderProps> = ({
  totalSolved,
  totalCtfs,
  onOpenResidents,
  onOpenLogs,
  onReset,
  onToggleCrt,
  crtEnabled,
  activeBuildingName,
  onReturnToMap,
  onReturnToGate
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [timeString, setTimeString] = useState('');
  const [cycleVal, setCycleVal] = useState(841.03);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setTimeString(`${h}:${m}:${s} SZT`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMuteToggle = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  const integrityPct = Math.round(18 + (totalSolved / totalCtfs) * 82);

  return (
    <>
      <header className="relative z-40 w-full bg-[#0d1015]/95 border-b border-[#263040] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs select-none backdrop-blur-md">
        {/* Left: Brand & Hierarchy */}
        <div className="flex items-center gap-3">
          {/* Hexagonal / Tactical icon */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded border border-yellow-500/40 bg-yellow-500/10 text-yellow-400 font-bold text-sm tracking-wider">
            <span className="animate-pulse">M</span>
            <div className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-yellow-400"></div>
            <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-yellow-400"></div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-yellow-400 tracking-wider text-sm flex items-center gap-1.5">
                MANU PROTOCOL
                <span className="text-[10px] px-1 py-0.2 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">v2.4.9</span>
              </span>
              <span className="text-zinc-600">/</span>
              <span className="font-tech text-zinc-300 font-semibold tracking-wider">SANCTUARY ZERO</span>
            </div>
            
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono-code">
              <span className="text-yellow-400/90 font-medium">COMMUNITY // YELLOW ZONE</span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-500">CYCLE {cycleVal} // {timeString}</span>
              {onReturnToGate && (
                <>
                  <span className="text-zinc-600">|</span>
                  <button
                    onClick={() => { sound.playClick(); onReturnToGate(); }}
                    className="text-zinc-400 hover:text-yellow-400 underline cursor-pointer transition-colors"
                    title="Inspect Perimeter Gate-01"
                  >
                    GATE-01
                  </button>
                </>
              )}
              {activeBuildingName && (
                <>
                  <span className="text-zinc-600">|</span>
                  <button 
                    onClick={() => { sound.playClick(); onReturnToMap && onReturnToMap(); }}
                    className="text-yellow-400 underline hover:text-yellow-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>&larr; MAP VIEW</span>
                    <span className="text-zinc-500">/</span>
                    <span className="text-white font-bold">{activeBuildingName}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center: System Status & Sector Stability */}
        <div className="hidden lg:flex items-center gap-4 bg-[#141922] px-3 py-1.5 rounded border border-[#2b3545]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
            </span>
            <span className="text-[11px] text-zinc-300 font-mono-code">
              MEMORY PURGE ACTIVE
            </span>
          </div>

          <div className="h-3 w-[1px] bg-zinc-700"></div>

          <div className="flex items-center gap-2 font-mono-code text-[11px]">
            <span className="text-zinc-400">DATA INTEGRITY:</span>
            <div className="w-24 h-2 bg-zinc-800 rounded-sm overflow-hidden border border-zinc-700">
              <div 
                className="h-full bg-yellow-400 transition-all duration-500"
                style={{ width: `${integrityPct}%` }}
              ></div>
            </div>
            <span className="text-yellow-400 font-semibold">{integrityPct}%</span>
          </div>

          <div className="h-3 w-[1px] bg-zinc-700"></div>

          <div className="flex items-center gap-1.5 font-mono-code text-[11px]">
            <span className="text-zinc-400">CTF PROGRESS:</span>
            <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/30">
              {totalSolved} / {totalCtfs}
            </span>
          </div>
        </div>

        {/* Right: Interactive Tactical Utilities */}
        <div className="flex items-center gap-2">
          {/* Recovered Resident Dossiers Button */}
          <button
            onClick={() => { sound.playClick(); onOpenResidents(); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[#354153] bg-[#161c24] hover:border-yellow-500/50 hover:bg-[#1e2530] text-zinc-200 transition-colors cursor-pointer group"
            title="Inspect Recovered Resident Profiles"
          >
            <Users size={14} className="text-yellow-400 group-hover:scale-110 transition-transform" />
            <span className="font-tech text-xs hidden sm:inline">RESIDENTS</span>
            <span className="text-[10px] px-1 rounded bg-yellow-400/20 text-yellow-300 font-mono-code">
              {Math.min(5, Math.ceil((totalSolved / 2)))}/5
            </span>
          </button>

          {/* Terminal System Logs */}
          <button
            onClick={() => { sound.playClick(); onOpenLogs(); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[#354153] bg-[#161c24] hover:border-yellow-500/50 hover:bg-[#1e2530] text-zinc-200 transition-colors cursor-pointer"
            title="View Terminal Logs"
          >
            <Terminal size={14} className="text-zinc-400" />
            <span className="font-tech text-xs hidden sm:inline">LOGS</span>
          </button>

          {/* CRT scanlines toggle */}
          <button
            onClick={() => { sound.playClick(); onToggleCrt(); }}
            className={`p-1.5 rounded border transition-colors cursor-pointer ${
              crtEnabled 
                ? 'border-yellow-500/60 bg-yellow-500/10 text-yellow-400' 
                : 'border-[#354153] bg-[#161c24] text-zinc-400 hover:text-zinc-200'
            }`}
            title="Toggle CRT Scanline Filter"
          >
            <Tv size={14} />
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={handleMuteToggle}
            className={`p-1.5 rounded border transition-colors cursor-pointer ${
              !isMuted 
                ? 'border-yellow-500/60 bg-yellow-500/10 text-yellow-400' 
                : 'border-[#354153] bg-[#161c24] text-zinc-500'
            }`}
            title={isMuted ? 'Unmute Audio Synthesizer' : 'Mute Audio Synthesizer'}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>

          {/* Instructions / Help */}
          <button
            onClick={() => { sound.playClick(); setShowHelp(!showHelp); }}
            className="p-1.5 rounded border border-[#354153] bg-[#161c24] hover:border-yellow-500/50 text-zinc-300 transition-colors cursor-pointer"
            title="Prototype Guide & Controls"
          >
            <HelpCircle size={14} />
          </button>

          {/* Reset Prototype */}
          <button
            onClick={() => { sound.playClick(); onReset(); }}
            className="p-1.5 rounded border border-[#354153] bg-[#161c24] hover:border-red-500/50 hover:text-red-400 text-zinc-400 transition-colors cursor-pointer"
            title="Reset CTFs & Explored State"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </header>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-[#11151c] border border-yellow-500/50 p-6 rounded shadow-2xl relative text-xs font-mono-code">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <span className="font-display font-bold text-yellow-400 text-sm flex items-center gap-2">
                <ShieldAlert size={16} />
                MANU PROTOCOL // PROTOTYPE GUIDE
              </span>
              <button 
                onClick={() => setShowHelp(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                [ESC / CLOSE]
              </button>
            </div>

            <div className="space-y-3 text-zinc-300">
              <p>
                <strong className="text-yellow-400">OBJECTIVE:</strong> Sanctuary Zero's identity system is purging citizen memory records. Explore the 5 Community buildings in the Yellow Zone to decrypt 10 CTF terminal points.
              </p>
              
              <div className="bg-[#181f2a] p-3 rounded border border-zinc-700 space-y-2">
                <div className="text-yellow-300 font-bold">INTERACTIVE CONTROLS:</div>
                <div>• <span className="text-white">Map Navigation:</span> Hover buildings to inspect status; click <strong>[ENTER]</strong> to access building entrance.</div>
                <div>• <span className="text-white">3D FPP Room:</span> Walk with <strong>[W][A][S][D]</strong>, look with <strong>Mouse</strong> (click screen to look freely). Walk up to terminals and press <strong>[E]</strong> or click to open CTFs!</div>
                <div>• <span className="text-white">2D / 3D Toggle:</span> You can switch between 3D FPP Walkthrough and 2D Tactical Console at any time inside a building.</div>
                <div>• <span className="text-white">CTFs & Dossiers:</span> Solve CTFs to recover lost resident records and restore sector memory integrity.</div>
              </div>

              <div className="text-zinc-400 text-[11px]">
                Tip: Walk to the airlock door in the back of the 3D room to return to the Community Map.
              </div>
            </div>

            <button 
              onClick={() => { sound.playClick(); setShowHelp(false); }}
              className="mt-5 w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-tech font-bold tracking-wider rounded cursor-pointer transition-colors"
            >
              ACKNOWLEDGE & RESUME
            </button>
          </div>
        </div>
      )}
    </>
  );
};
