import { cn } from "@/lib/utils";
import type { LogEntry, LogLevel } from "@/types";

const levelStyles: Record<
  LogLevel,
  { border: string; value?: string }
> = {
  info: { border: "border-outline" },
  success: { border: "border-secondary" },
  warning: {
    border: "border-primary-container",
    value: "text-on-primary-fixed-variant font-bold",
  },
  alert: { border: "border-primary", value: "text-primary font-bold" },
  muted: { border: "border-outline opacity-50" },
};

/**
 * A single terminal-style log line. `level` drives the left accent border
 * and emphasis, matching the Sentinel live-logs console.
 */
export default function TerminalLogItem({
  time,
  message,
  level,
  detail,
}: LogEntry) {
  const style = levelStyles[level];
  return (
    <div
      className={cn(
        "border-l-2 pl-sm py-xs transition-all duration-500",
        style.border
      )}
    >
      <p className="font-label-sm text-on-surface-variant opacity-60">{time}</p>
      <p className={cn("font-label-sm text-on-surface", style.value)}>
        {message}
      </p>
      {detail && (
        <p className="font-label-sm text-on-surface-variant italic">{detail}</p>
      )}
    </div>
  );
}
