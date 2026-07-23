import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Eye, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

import Panel from "@/components/common/Panel";
import StatusBadge from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";
import { usePredictions } from "@/hooks/usePredictions";
import type { Prediction, Decision } from "@/types";

function decisionTone(d: Decision): "allow" | "review" | "block" {
  if (d === "BLOCK") return "block";
  if (d === "REVIEW") return "review";
  return "allow";
}

function riskTone(p: number): "error" | "primaryContainer" | "secondary" {
  if (p >= 0.7) return "error";
  if (p >= 0.4) return "primaryContainer";
  return "secondary";
}

const barFill: Record<string, string> = {
  error: "bg-error",
  primaryContainer: "bg-primary-container",
  secondary: "bg-secondary",
};

const valueText: Record<string, string> = {
  error: "text-error",
  primaryContainer: "text-primary-container",
  secondary: "text-secondary",
};

export default function Transactions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const decisionParam = searchParams.get("decision") || "ALL";
  const searchParam = searchParams.get("search") || "";

  const [filterDecision, setFilterDecision] = useState<string>(decisionParam);
  const [searchTerm, setSearchTerm] = useState<string>(searchParam);
  const [sortField, setSortField] = useState<"probability" | "id" | "user">("probability");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const { data: rawData = [], isLoading, error } = usePredictions();

  const predictions: Prediction[] = useMemo(() => {
    return rawData.map((p) => ({
      id: p.transactionID,
      user: p.userID,
      probability: p.fraudProbability,
      decision: p.decision as Decision,
      riskFlags: p.riskFlags ?? [],
    }));
  }, [rawData]);

  const filteredData = useMemo(() => {
    return predictions.filter((item) => {
      // Decision filter
      if (filterDecision !== "ALL" && item.decision !== filterDecision) {
        return false;
      }
      // Search term filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesId = item.id.toLowerCase().includes(term);
        const matchesUser = item.user.toLowerCase().includes(term);
        const matchesFlags = item.riskFlags.some((f) => f.toLowerCase().includes(term));
        if (!matchesId && !matchesUser && !matchesFlags) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === "string") valA = (valA as string).toLowerCase();
      if (typeof valB === "string") valB = (valB as string).toLowerCase();

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [predictions, filterDecision, searchTerm, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleDecisionChange = (value: string) => {
    setFilterDecision(value);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (value === "ALL") {
      newParams.delete("decision");
    } else {
      newParams.set("decision", value);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (!value) {
      newParams.delete("search");
    } else {
      newParams.set("search", value);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="space-y-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-md">
        <div>
          <h1 className="font-heading text-headline-md font-bold text-on-surface">
            Transactions Directory
          </h1>
          <p className="font-body text-body-md text-on-surface-variant">
            Full audit ledger of ingested transaction scoring events
          </p>
        </div>
        <div className="flex items-center gap-md">
          <span className="font-label-md text-label-md text-on-surface-variant">
            Showing <strong className="text-on-surface">{filteredData.length}</strong> entries
          </span>
        </div>
      </div>

      {/* Control bar */}
      <Panel className="p-md" bodyClassName="flex flex-col md:flex-row gap-md items-center justify-between">
        <div className="flex flex-1 items-center bg-surface-container-low px-md py-xs rounded-lg border border-outline-variant/30 w-full max-w-md">
          <Search size={18} className="text-on-surface-variant mr-sm shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by Transaction ID, User ID, or Risk Flags..."
            className="bg-transparent border-none outline-none focus:ring-0 w-full font-body text-body-md text-on-surface placeholder:text-on-surface-variant/70"
          />
        </div>

        <div className="flex flex-wrap items-center gap-md w-full md:w-auto">
          {/* Decision filter */}
          <div className="flex items-center gap-xs">
            <Filter size={16} className="text-on-surface-variant" />
            <select
              value={filterDecision}
              onChange={(e) => handleDecisionChange(e.target.value)}
              className="bg-surface-container-low border border-outline-variant/30 text-on-surface font-label-md text-label-sm rounded-lg px-md py-sm outline-none cursor-pointer"
            >
              <option value="ALL">All Decisions</option>
              <option value="ALLOW">ALLOW</option>
              <option value="REVIEW">REVIEW</option>
              <option value="BLOCK">BLOCK</option>
            </select>
          </div>

          {/* Sort field */}
          <div className="flex items-center gap-xs">
            <ArrowUpDown size={16} className="text-on-surface-variant" />
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as "probability" | "id" | "user")}
              className="bg-surface-container-low border border-outline-variant/30 text-on-surface font-label-md text-label-sm rounded-lg px-md py-sm outline-none cursor-pointer"
            >
              <option value="probability">Sort by Risk Score</option>
              <option value="id">Sort by Transaction ID</option>
              <option value="user">Sort by User ID</option>
            </select>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="px-sm py-sm bg-surface-container-high text-on-surface rounded-lg font-label-sm"
            >
              {sortAsc ? "ASC" : "DESC"}
            </button>
          </div>
        </div>
      </Panel>

      {/* Main Table */}
      <Panel headerBorder bodyClassName="overflow-x-auto">
        {isLoading ? (
          <div className="p-xl text-center text-on-surface-variant">Loading transactions...</div>
        ) : error ? (
          <div className="p-xl text-center text-red-500">Failed to load transactions.</div>
        ) : paginatedData.length === 0 ? (
          <div className="p-xl text-center text-on-surface-variant">No matching transactions found.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  User Identifier
                </th>
                <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Risk Prob.
                </th>
                <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Decision
                </th>
                <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Risk Flags
                </th>
                <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {paginatedData.map((row) => {
                const probability = Number(row.probability ?? 0);
                const tone = riskTone(probability);
                return (
                  <tr key={row.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-lg py-md font-label-md text-on-surface whitespace-nowrap">
                      {row.id}
                    </td>
                    <td className="px-lg py-md font-label-md text-on-surface-variant whitespace-nowrap">
                      {row.user}
                    </td>
                    <td className="px-lg py-md">
                      <div className="flex items-center gap-sm">
                        <div className="w-16 h-2 bg-surface-container-high rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", barFill[tone])}
                            style={{ width: `${Math.round(probability * 100)}%` }}
                          />
                        </div>
                        <span className={cn("font-label-md", valueText[tone])}>
                          {probability.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-lg py-md">
                      <StatusBadge label={row.decision} tone={decisionTone(row.decision)} />
                    </td>
                    <td className="px-lg py-md">
                      <div className="flex flex-wrap gap-1 max-w-[240px]">
                        {row.riskFlags?.length ? (
                          row.riskFlags.map((flag) => (
                            <span
                              key={flag}
                              className="px-2 py-1 rounded-full text-[10px] font-semibold bg-error/10 text-error"
                            >
                              {flag}
                            </span>
                          ))
                        ) : (
                          <span className="text-on-surface-variant text-xs">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-lg py-md text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/investigation/new?id=${row.id}`)}
                        className="p-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                        title="Investigate"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-lg py-md border-t border-outline-variant/20">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-sm">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="p-xs rounded bg-surface-container-high disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="p-xs rounded bg-surface-container-high disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
