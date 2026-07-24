import { Terminal, History } from "lucide-react";

import Panel from "@/components/common/Panel";
import TerminalLogItem from "./TerminalLogItem";
import type { LogEntry } from "@/types";

const mockLogs: LogEntry[] = [
  { id: "l1", time: "6:57:41 PM", message: "DATA_INGEST: Batch #2747 received", level: "info" },
  { id: "l2", time: "6:57:33 PM", message: "DATA_INGEST: Batch #72 received", level: "info" },
  { id: "l3", time: "6:57:25 PM", message: "DATA_INGEST: Batch #1441 received", level: "info" },
  { id: "l4", time: "6:57:17 PM", message: "DATA_INGEST: Batch #6973 received", level: "info" },
  { id: "l5", time: "6:57:09 PM", message: "HEARTBEAT: Health Check Green", level: "success" },
  {
    id: "l6",
    time: "12:45:01 UTC",
    message: "MODEL_INIT_SUCCESS: XGBoost v1.0.4 loaded.",
    level: "success",
  },
  {
    id: "l7",
    time: "12:44:58 UTC",
    message: "THRESHOLD_ALERT: Risk Score > 0.90 detected.",
    level: "alert",
    detail: "Ref: TX-9421-B flagged for immediate block.",
  },
  {
    id: "l8",
    time: "12:44:30 UTC",
    message: "DB_SYNC: Transaction batch 4022 processed.",
    level: "info",
  },
  {
    id: "l9",
    time: "12:44:15 UTC",
    message: "HEARTBEAT: System health normal. Latency: 22ms.",
    level: "info",
  },
  {
    id: "l10",
    time: "12:43:55 UTC",
    message: "QUEUE_UPDATE: Review queue increased (+4).",
    level: "warning",
  },
  {
    id: "l11",
    time: "12:43:10 UTC",
    message: "AUDIT_LOG: User 'Analyst 402' logged in.",
    level: "muted",
  },
];

interface Props {
  /**
   * Live entries. Today this is mock data; swap in a WebSocket feed later
   * without touching the component — just pass `logs` from the socket.
   */
  logs?: LogEntry[];
}

export default function LiveLogs({ logs = mockLogs }: Props) {
  return (
    <Panel
      title="Live System Logs"
      icon={Terminal}
      headerBorder
      className="lg:col-span-1 max-h-[500px]"
      bodyClassName="p-lg overflow-y-auto custom-scrollbar flex-1 min-h-0"
      footer={
        <div className="p-md bg-surface-container-high flex justify-center">
          <button className="text-label-sm font-label-sm text-on-surface-variant uppercase flex items-center gap-xs hover:text-primary transition-colors">
            <History size={14} /> Full Log History
          </button>
        </div>
      }
    >
      <div className="space-y-md">
        {logs.map((log) => (
          <TerminalLogItem key={log.id} {...log} />
        ))}
      </div>
    </Panel>
  );
}
