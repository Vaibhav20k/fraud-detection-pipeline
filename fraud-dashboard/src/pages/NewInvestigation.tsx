import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Panel from "@/components/common/Panel";

export default function NewInvestigation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const txId = searchParams.get("id") || "TX-DEMO-9421";

  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"INVESTIGATING" | "CONFIRMED_FRAUD" | "FALSE_POSITIVE">("INVESTIGATING");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-lg max-w-4xl mx-auto">
      <div className="flex items-center gap-md">
        <button
          onClick={() => navigate(-1)}
          className="p-sm bg-surface-container-high rounded-full hover:bg-surface-container-highest transition-colors cursor-pointer text-on-surface"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-heading text-headline-md font-bold text-on-surface">
            Case Investigation #{txId}
          </h1>
          <p className="font-body text-body-md text-on-surface-variant">
            Fraud Analyst Workspace & Decision Override Terminal
          </p>
        </div>
      </div>

      {submitted ? (
        <Panel className="p-xl text-center space-y-md">
          <div className="w-12 h-12 bg-secondary/20 text-secondary rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-headline-sm font-bold text-on-surface">
            Investigation Case Saved
          </h2>
          <p className="text-on-surface-variant max-w-md mx-auto">
            Decision outcome <strong>{status}</strong> logged for transaction {txId}. Audit log updated.
          </p>
          <div className="pt-md flex justify-center gap-md">
            <button
              onClick={() => navigate("/risk-queue")}
              className="bg-primary text-on-primary font-label-md px-lg py-sm rounded-lg hover:opacity-90 transition-all cursor-pointer"
            >
              Back to Risk Queue
            </button>
            <button
              onClick={() => navigate("/transactions")}
              className="bg-surface-container-high text-on-surface font-label-md px-lg py-sm rounded-lg hover:bg-surface-container-highest transition-all cursor-pointer"
            >
              View Transactions
            </button>
          </div>
        </Panel>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-lg">
          <Panel title="Transaction Summary" headerBorder bodyClassName="p-lg space-y-md">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
              <div>
                <p className="text-xs text-on-surface-variant uppercase font-mono">Case Target</p>
                <p className="font-bold text-on-surface">{txId}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant uppercase font-mono">Assigned Analyst</p>
                <p className="font-bold text-on-surface">Analyst 402</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant uppercase font-mono">Severity</p>
                <p className="font-bold text-error">HIGH_RISK</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant uppercase font-mono">Initial Recommendation</p>
                <p className="font-bold text-primary">BLOCK</p>
              </div>
            </div>
          </Panel>

          <Panel title="Analyst Action & Determination" headerBorder bodyClassName="p-lg space-y-md">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-xs">Outcome Determination</label>
              <div className="grid grid-cols-3 gap-md">
                <button
                  type="button"
                  onClick={() => setStatus("INVESTIGATING")}
                  className={`p-md rounded-lg border text-sm font-bold transition-all cursor-pointer ${
                    status === "INVESTIGATING"
                      ? "border-primary bg-primary-container text-on-primary-container"
                      : "border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  Under Review
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("CONFIRMED_FRAUD")}
                  className={`p-md rounded-lg border text-sm font-bold transition-all cursor-pointer ${
                    status === "CONFIRMED_FRAUD"
                      ? "border-error bg-error/20 text-error"
                      : "border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  Confirm Fraud
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("FALSE_POSITIVE")}
                  className={`p-md rounded-lg border text-sm font-bold transition-all cursor-pointer ${
                    status === "FALSE_POSITIVE"
                      ? "border-secondary bg-secondary/20 text-secondary"
                      : "border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  False Positive
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-on-surface mb-xs">Investigation Notes & Findings</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter investigation details, customer contact outcome, or evidence..."
                rows={4}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-md text-on-surface font-body outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-md">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-lg py-sm bg-surface-container-high text-on-surface font-label-md rounded-lg hover:bg-surface-container-highest cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-lg py-sm bg-primary text-on-primary font-label-md rounded-lg hover:opacity-90 shadow-soft cursor-pointer"
              >
                Submit Case Decision
              </button>
            </div>
          </Panel>
        </form>
      )}
    </div>
  );
}
