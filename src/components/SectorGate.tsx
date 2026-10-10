import React, { useState } from 'react';
import { sound } from '../utils/sound';
import { 
  Fingerprint, 
  Unlock, 
  ChevronRight, 
  Compass,
  Radio,
  Building2,
  Users
} from 'lucide-react';

interface SectorGateProps {
  onBreachGate: () => void;
}

export const SectorGate: React.FC<SectorGateProps> = ({ onBreachGate }) => {
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'granted' | 'opening'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [telemetryText, setTelemetryText] = useState('AWAITING OPERATIVE BIOMETRIC ENGAGEMENT');

  const handleStartScan = () => {
    if (scanState !== 'idle') return;

    sound.playBiometricScan();
    setScanState('scanning');
    setTelemetryText('INITIALIZING ATMOSPHERIC DECONTAMINATION & MEMORY PROBE...');

    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setScanProgress(p);

      if (p === 35) {
        sound.playTerminalBeep(true);
        setTelemetryText('BIOMETRIC CHECKSUM: PARTIAL CORRUPTION DETECTED. IDENTITY UNVERIFIED.');
      } else if (p === 70) {
        sound.playTerminalBeep(false);
        setTelemetryText('OVERRIDE CODE [MANU-ALPHA] INJECTED. DEPRESSURIZING PERIMETER HYDRAULICS...');
      } else if (p >= 100) {
        clearInterval(interval);
        sound.playSuccess();
        setScanState('granted');
        setTelemetryText('ACCESS AUTHORIZED: BREACHING APERTURE GATE-01...');

        // Start blast door opening sequence
        setTimeout(() => {
          sound.playGateOpen();
          setScanState('opening');

          setTimeout(() => {
            onBreachGate();
          }, 1400);
        }, 600);
      }
    }, 70);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#040609] text-zinc-200 select-none flex flex-col justify-between font-mono-code">
      
      {/* ========================================================= */}
      {/* BACKGROUND: CINEMATIC SILHOUETTED SOCIETY & RESIDENTIAL MEGASTRUCTURES */}
      {/* ========================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Night Atmospheric Sky with hazy dystopian fog */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060a12] via-[#09101d] to-[#04060a]" />

        {/* Distant City Skyline Silhouettes with Glowing Windows */}
        <svg className="absolute inset-0 w-full h-full object-cover opacity-85" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1440 900">
          <defs>
            {/* Window Glow Patterns */}
            <pattern id="windowGrid1" width="12" height="18" patternUnits="userSpaceOnUse">
              <rect x="2" y="2" width="6" height="5" fill="#facc15" opacity="0.35" />
              <rect x="2" y="10" width="6" height="5" fill="#38bdf8" opacity="0.25" />
            </pattern>
            <pattern id="windowGrid2" width="16" height="24" patternUnits="userSpaceOnUse">
              <rect x="3" y="3" width="8" height="7" fill="#fbbf24" opacity="0.45" />
              <rect x="3" y="14" width="8" height="7" fill="#f43f5e" opacity="0.2" />
            </pattern>
            <pattern id="windowGridDense" width="8" height="12" patternUnits="userSpaceOnUse">
              <rect x="1" y="1" width="4" height="3" fill="#e2e8f0" opacity="0.3" />
              <rect x="1" y="6" width="4" height="3" fill="#eab308" opacity="0.3" />
            </pattern>

            {/* Atmospheric Sky Glow */}
            <radialGradient id="skyHaze" cx="50%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#0f172a" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
            </radialGradient>
          </defs>

          {/* Sky Gradient */}
          <rect width="100%" height="100%" fill="url(#skyHaze)" />

          {/* FAR BACKGROUND: Towering High-Rise Habitation Spires */}
          <g opacity="0.4">
            {/* Spire 1 (Left Far) */}
            <polygon points="60,900 60,220 110,140 160,220 160,900" fill="#090d15" />
            <line x1="110" y1="140" x2="110" y2="90" stroke="#f43f5e" strokeWidth="2" />
            <circle cx="110" cy="90" r="3" fill="#ef4444" className="animate-ping" />

            {/* Spire 2 (Center Left) */}
            <polygon points="280,900 280,180 340,110 400,180 400,900" fill="#0b111a" />
            <rect x="290" y="220" width="100" height="450" fill="url(#windowGridDense)" opacity="0.35" />

            {/* Spire 3 (Center Far) */}
            <polygon points="650,900 650,140 720,80 790,140 790,900" fill="#0c131f" />
            <line x1="720" y1="80" x2="720" y2="40" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="720" cy="40" r="3" fill="#38bdf8" className="animate-pulse" />
            <rect x="665" y="160" width="110" height="500" fill="url(#windowGrid1)" opacity="0.4" />

            {/* Spire 4 (Right Far) */}
            <polygon points="1020,900 1020,160 1080,90 1140,160 1140,900" fill="#0b111c" />
            <line x1="1080" y1="90" x2="1080" y2="50" stroke="#ef4444" strokeWidth="2" />
            <circle cx="1080" cy="50" r="3" fill="#ef4444" className="animate-ping" />

            {/* Spire 5 (Right edge) */}
            <polygon points="1260,900 1260,240 1320,170 1380,240 1380,900" fill="#090d15" />
          </g>

          {/* MID-GROUND: High-Density Residential Modular Blocks ("Theta Blocks") */}
          <g opacity="0.75">
            {/* Block Theta-1 */}
            <rect x="140" y="320" width="190" height="580" fill="#0d1420" />
            <rect x="150" y="340" width="170" height="420" fill="url(#windowGrid1)" />
            {/* Roof antennae */}
            <line x1="170" y1="320" x2="170" y2="280" stroke="#64748b" strokeWidth="2" />
            <line x1="280" y1="320" x2="280" y2="270" stroke="#64748b" strokeWidth="2" />

            {/* Block Theta-2 (Sky-Bridge linked) */}
            <rect x="420" y="280" width="220" height="620" fill="#0f1826" />
            <rect x="435" y="300" width="190" height="480" fill="url(#windowGrid2)" />

            {/* Skybridge connecting Block 1 and Block 2 */}
            <rect x="330" y="440" width="90" height="24" fill="#1e293b" />
            <line x1="330" y1="448" x2="420" y2="448" stroke="#facc15" strokeWidth="2" strokeDasharray="6 4" />
            <rect x="330" y="580" width="90" height="20" fill="#1e293b" />

            {/* Block Theta-3 (Center-Right Habitation Monolith) */}
            <rect x="820" y="260" width="240" height="640" fill="#0f1725" />
            <rect x="835" y="280" width="210" height="500" fill="url(#windowGrid1)" />
            {/* Skybridge from Center to Right */}
            <rect x="1060" y="390" width="110" height="22" fill="#1e293b" />
            <line x1="1060" y1="398" x2="1170" y2="398" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 4" />

            {/* Block Theta-4 */}
            <rect x="1170" y="310" width="210" height="590" fill="#0d1420" />
            <rect x="1185" y="330" width="180" height="460" fill="url(#windowGridDense)" />
          </g>

          {/* Dystopian Holographic Neon Society Billboards */}
          <g>
            {/* Billboard Left */}
            <rect x="170" y="350" width="130" height="34" fill="#0f172a" stroke="#eab308" strokeWidth="1.5" />
            <text x="235" y="372" textAnchor="middle" fill="#facc15" fontSize="11" fontFamily="'Chakra Petch', sans-serif" fontWeight="bold" letterSpacing="2">
              SANCTUARY ZERO
            </text>

            {/* Billboard Right */}
            <rect x="860" y="300" width="160" height="32" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="940" y="321" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="bold">
              COMMUNITY // YELLOW ZONE
            </text>
          </g>

          {/* Flying Surveillance Drones Crossing the Sky */}
          <g className="animate-pulse">
            <line x1="220" y1="190" x2="280" y2="190" stroke="#f43f5e" strokeWidth="1.5" />
            <circle cx="280" cy="190" r="3" fill="#f43f5e" />

            <line x1="910" y1="160" x2="980" y2="160" stroke="#38bdf8" strokeWidth="1.5" />
            <circle cx="980" cy="160" r="3" fill="#38bdf8" />
          </g>

          {/* Foreground Perimeter Wall Bulkhead Silhouette */}
          <polygon points="0,900 0,720 1440,720 1440,900" fill="#080c13" />
          <line x1="0" y1="720" x2="1440" y2="720" stroke="#334155" strokeWidth="3" />
          {/* Barbed sensor fence */}
          <path d="M 0 710 L 1440 710" stroke="#eab308" strokeWidth="1" strokeDasharray="8 6" opacity="0.6" />
        </svg>

        {/* Ambient atmospheric steam & volumetric glow */}
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-[#040609] via-[#080d16]/80 to-transparent" />
      </div>

      {/* ========================================================= */}
      {/* TOP HEADER: PERIMETER GATEWAY STATUS */}
      {/* ========================================================= */}
      <header className="relative z-20 w-full px-6 py-4 border-b border-[#1c2636]/90 bg-[#070b10]/85 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded border border-yellow-500/70 bg-yellow-500/15 flex items-center justify-center text-yellow-400 font-bold font-display text-lg shadow-[0_0_20px_rgba(250,204,21,0.25)]">
            M0
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-white tracking-widest text-sm">
                SANCTUARY ZERO
              </span>
              <span className="text-zinc-600">//</span>
              <span className="font-tech text-yellow-400 font-bold tracking-wider">
                SECURITY GATE-01: APERTURE NORTH
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Building2 size={11} className="text-yellow-400" />
                <span>OVERLOOKING COMMUNITY HABITAT SECTOR</span>
              </span>
              <span>&bull;</span>
              <span className="text-amber-400 font-semibold animate-pulse">CITIZEN PURGE IN PROGRESS</span>
            </div>
          </div>
        </div>

        {/* Quick Ingress Action */}
        <button
          onClick={() => {
            sound.playGateOpen();
            onBreachGate();
          }}
          className="text-xs text-zinc-300 hover:text-yellow-400 flex items-center gap-1.5 px-3.5 py-1.5 rounded border border-zinc-700 hover:border-yellow-500/60 bg-[#101520]/90 cursor-pointer transition-colors shadow-lg"
        >
          <span>[ BYPASS SCAN & ENTER SECTOR ]</span>
          <ChevronRight size={14} />
        </button>
      </header>

      {/* ========================================================= */}
      {/* CENTER STAGE: THE MASSIVE DECONTAMINATION BLAST APERTURE */}
      {/* ========================================================= */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-[#090d14]/95 border-2 border-[#243245] rounded-xl p-6 md:p-8 shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden backdrop-blur-md">
          
          {/* Tactical Corner Brackets */}
          <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-yellow-400" />
          <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-yellow-400" />
          <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-yellow-400" />
          <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-yellow-400" />

          {/* Subtitle */}
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-3 border-b border-zinc-800 pb-2">
            <span className="font-tech text-yellow-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Radio size={13} className="text-yellow-400 animate-pulse" />
              <span>PERIMETER DECONTAMINATION AIRLOCK PORTAL</span>
            </span>
            <span className="text-[10px] text-zinc-500">INGRESS CODE: APERTURE-01</span>
          </div>

          {/* Gate Aperture Split Doors Animation */}
          <div className="relative h-64 md:h-80 w-full bg-[#05080e] rounded-lg border border-[#1d2737] overflow-hidden flex items-center justify-center mb-6 shadow-inner">
            
            {/* The Behind-Gate Glowing Society Preview */}
            <div className="absolute inset-0 bg-[radial-gradient(#facc15_1px,transparent_1px)] [background-size:18px_18px] opacity-40 flex items-center justify-center flex-col text-center p-6">
              <div className="w-20 h-20 rounded-full border-2 border-yellow-400/60 bg-yellow-400/10 flex items-center justify-center animate-spin" style={{ animationDuration: '14s' }}>
                <Compass size={36} className="text-yellow-400" />
              </div>
              <div className="font-display font-bold text-xl text-yellow-300 mt-3 tracking-widest glow-yellow">
                SANCTUARY ZERO // YELLOW SECTOR
              </div>
              <div className="text-xs text-zinc-300 font-mono-code mt-1">
                TRANSITIONING TO COMMUNITY NODAL NETWORK...
              </div>
            </div>

            {/* Left Blast Door Panel */}
            <div 
              className={`absolute top-0 bottom-0 left-0 w-1/2 bg-[#121924] border-r-2 border-yellow-500/70 transition-transform duration-1000 ease-in-out z-10 flex flex-col justify-between p-4 ${
                scanState === 'opening' ? '-translate-x-full' : 'translate-x-0'
              }`}
            >
              <div className="text-[10px] text-zinc-400">GATE-01 // LEFT APERTURE PISTON</div>
              {/* Hazard Stripes */}
              <div className="h-6 w-full bg-[repeating-linear-gradient(45deg,#1f2937,#1f2937_10px,#facc15_10px,#facc15_20px)] opacity-50 rounded"></div>
              <div className="text-right text-[10px] text-yellow-400 font-tech">HYDRAULIC-L [ENGAGED]</div>
            </div>

            {/* Right Blast Door Panel */}
            <div 
              className={`absolute top-0 bottom-0 right-0 w-1/2 bg-[#121924] border-l-2 border-yellow-500/70 transition-transform duration-1000 ease-in-out z-10 flex flex-col justify-between p-4 ${
                scanState === 'opening' ? 'translate-x-full' : 'translate-x-0'
              }`}
            >
              <div className="text-right text-[10px] text-zinc-400">GATE-01 // RIGHT APERTURE PISTON</div>
              {/* Hazard Stripes */}
              <div className="h-6 w-full bg-[repeating-linear-gradient(-45deg,#1f2937,#1f2937_10px,#facc15_10px,#facc15_20px)] opacity-50 rounded"></div>
              <div className="text-left text-[10px] text-yellow-400 font-tech">HYDRAULIC-R [ENGAGED]</div>
            </div>

            {/* Center Biometric Terminal Interface (Overlaid on blast door) */}
            {scanState !== 'opening' && (
              <div className="relative z-20 flex flex-col items-center justify-center p-6 text-center">
                <button
                  onClick={handleStartScan}
                  disabled={scanState === 'scanning' || scanState === 'granted'}
                  className={`w-28 h-28 rounded-full border-2 transition-all flex flex-col items-center justify-center cursor-pointer shadow-2xl group ${
                    scanState === 'scanning'
                      ? 'border-yellow-400 bg-yellow-400/20 animate-pulse shadow-[0_0_40px_rgba(250,204,21,0.7)]'
                      : scanState === 'granted'
                      ? 'border-emerald-400 bg-emerald-400/20 shadow-[0_0_40px_rgba(16,185,129,0.7)]'
                      : 'border-yellow-500/60 bg-[#0d131d]/90 hover:border-yellow-400 hover:bg-yellow-500/15 hover:shadow-[0_0_30px_rgba(250,204,21,0.4)]'
                  }`}
                >
                  <Fingerprint 
                    size={46} 
                    className={`transition-colors ${
                      scanState === 'scanning' 
                        ? 'text-yellow-300 animate-bounce' 
                        : scanState === 'granted'
                        ? 'text-emerald-400'
                        : 'text-yellow-400 group-hover:scale-110'
                    }`} 
                  />
                  <span className="text-[9px] font-tech font-bold text-zinc-200 mt-1 uppercase tracking-wider">
                    {scanState === 'scanning' ? 'ANALYZING...' : scanState === 'granted' ? 'AUTHORIZED' : 'TOUCH TO SCAN'}
                  </span>
                </button>

                {/* Progress bar during scan */}
                {scanState === 'scanning' && (
                  <div className="w-64 mt-4">
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                      <div 
                        className="h-full bg-yellow-400 transition-all duration-100" 
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-yellow-400 text-center mt-1">
                      SYNCHRONIZING OPERATIVE BIOMETRICS: {scanProgress}%
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Telemetry Status Readout */}
          <div className="space-y-4">
            <div className="bg-[#060a10] p-4 rounded-lg border border-[#1b2636] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                </span>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-tech">PERIMETER TELEMETRY FEED</div>
                  <div className="text-xs text-yellow-300 font-semibold">{telemetryText}</div>
                </div>
              </div>

              <div className="text-right hidden sm:block text-[11px] text-zinc-400">
                <div className="flex items-center gap-1.5 justify-end">
                  <Users size={12} className="text-yellow-400" />
                  <span>SOCIETY RESIDENTS: 142,000</span>
                </div>
                <div className="text-red-400 font-bold text-[10px]">RECORD PURGE CYCLE ACTIVE</div>
              </div>
            </div>

            {/* Direct Interactive Call to Action */}
            <button
              onClick={handleStartScan}
              disabled={scanState !== 'idle'}
              className="w-full py-4 rounded-lg bg-yellow-500 hover:bg-yellow-400 active:scale-[0.99] text-black font-tech font-bold text-base tracking-widest cursor-pointer shadow-[0_0_25px_rgba(250,204,21,0.35)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <Unlock size={18} />
              <span>[ ENGAGE BIOMETRICS & ENTER SANCTUARY ZERO SOCIETY ]</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer System Diagnostic Metadata */}
      <footer className="relative z-20 w-full px-6 py-3 border-t border-[#1c2636] bg-[#070b10]/90 backdrop-blur-md flex flex-wrap items-center justify-between text-[11px] text-zinc-500 font-mono-code">
        <div>
          <span>SANCTUARY ZERO // APERTURE GATEWAY // YELLOW ZONE ENTRY POINT</span>
        </div>
        <div className="flex items-center gap-4">
          <span>CONNECTS TO: 5 NODAL COMMUNITY HUBS</span>
          <span>&bull;</span>
          <span className="text-yellow-400">NODAL PATHWAY NETWORK READY</span>
        </div>
      </footer>
    </div>
  );
};
