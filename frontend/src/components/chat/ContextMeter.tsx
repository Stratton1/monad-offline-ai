/**
 * ContextMeter.tsx
 * Visual meter showing approximate context/session usage for long chats.
 * Used in chat headers beside controls.
 * Privacy: Computed locally from in-memory messages.
 */

interface ContextMeterProps {
  usagePercent: number;
}

export default function ContextMeter({ usagePercent }: ContextMeterProps) {
  const clamped = Math.min(Math.max(usagePercent, 0), 100);

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-slate-400">Context</span>
      <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="text-slate-300">{Math.round(clamped)}%</span>
    </div>
  );
}
