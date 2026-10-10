import React from 'react';
import { LogEntry } from '../types/protocol';
import { sound } from '../utils/sound';
import { X, Terminal, Shield, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface SystemLogsModalProps {
  logs: LogEntry[];
  onClose: () => void;
  onClearLogs: () => void;
}

export const SystemLogsModal: React.FC<SystemLogsModalProps> = ({
  logs,
  onClose,
  onClearLogs
}) => {
  return (
    <div role="dialog" aria-modal="true" aria-label="MANU system telemetry audit log" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="max-w-2xl w-full bg-[#0d121a] border-2 border-yellow-500/60 rounded-lg shadow-[0_0_50px_rgba(250,204,21,0.25)] flex flex-col overflow-hidden font-mono-code text-xs relative">
        <div className="bg-[#121824] px-5 py-3 border-b border-[#253245] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Terminal size={16} className="text-yellow-400" />
            <span className="font-tech text-yellow-400 font-bold text-sm tracking-widest">
              MANU SYSTEM TELEMETRY AUDIT LOG
            </span>
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

        <div className="p-5 overflow-y-auto max-h-[60vh] space-y-2 bg-[#090c12]">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`p-2.5 rounded border text-xs leading-relaxed flex items-start gap-2.5 ${
                log.level === 'warn'
                  ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                  : log.level === 'success'
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                  : 'bg-[#121722] border-zinc-800 text-zinc-300'
              }`}
            >
              <span className="text-[10px] text-zinc-500 font-mono-code whitespace-nowrap mt-0.5">
                [{log.timestamp}]
              </span>
              <span className="text-[10px] px-1 rounded bg-black/40 font-tech font-bold uppercase mt-0.5">
                {log.category}
              </span>
              <span className="flex-1">{log.message}</span>
            </div>
          ))}
        </div>

        <div className="bg-[#10151f] px-5 py-3 border-t border-[#253245] flex items-center justify-between">
          <button
            onClick={() => {
              sound.playClick();
              onClearLogs();
            }}
            className="text-zinc-500 hover:text-zinc-300 text-[11px] underline cursor-pointer"
          >
            Clear Log Buffer
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded bg-yellow-500 hover:bg-yellow-400 text-black font-tech font-bold text-xs cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
