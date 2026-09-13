"use client";

import { useState } from "react";
import { unitUlpin, formatINR } from "../lib/ulpin";

export default function MortgageForm({
  parcel,
  floor,
  unit,
  banks,
  onAddMortgage,
}) {
  const [bank, setBank] = useState(banks[0] || "");
  const [amount, setAmount] = useState("");
  const [borrower, setBorrower] = useState("");
  const [pendingConflict, setPendingConflict] = useState(null);
  const [confirmed, setConfirmed] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const ulpin = unitUlpin(parcel, floor, unit);
  const activeMortgages = unit.mortgages.filter(
    (mortgage) => mortgage.status === "active",
  );

  function buildDraft() {
    return {
      id: `MTG-${bank.split(" ")[0].toUpperCase()}-${Math.floor(
        1000 + Math.random() * 9000,
      )}`,
      bank,
      loanId: `${bank.split(" ")[0].toUpperCase()}-LN-${Math.floor(
        10000 + Math.random() * 89999,
      )}`,
      amount: Number(amount),
      dateIssued: new Date().toISOString().slice(0, 10),
      status: "active",
      borrower,
    };
  }

  async function register(draft) {
    try {
      setSaving(true);
      setSaveError("");

      await onAddMortgage(draft);

      setConfirmed(draft);
      setPendingConflict(null);
      setAmount("");
      setBorrower("");
    } catch (error) {
      console.error(error);
      setSaveError(error.message || "Could not save mortgage");
    } finally {
      setSaving(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    setConfirmed(null);
    setSaveError("");

    if (!amount || !borrower || Number(amount) <= 0) return;

    const draft = buildDraft();

    if (unit.status === "disputed" || activeMortgages.length > 0) {
      setPendingConflict(draft);
      return;
    }

    register(draft);
  }

  return (
    <div className="border border-line p-3 flex flex-col gap-3">
      <div className="text-[10px] uppercase tracking-[0.14em] text-muted">
        Tag New Mortgage — {ulpin}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-muted">Lending institution</span>
          <select
            value={bank}
            onChange={(event) => setBank(event.target.value)}
            className="bg-ink border border-line px-2 py-1.5 text-paper text-sm focus:outline-none focus:border-brass"
          >
            {banks.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs">
          <span className="text-muted">Borrower name</span>
          <input
            value={borrower}
            onChange={(event) => setBorrower(event.target.value)}
            placeholder="e.g. Rohit Sharma"
            className="bg-ink border border-line px-2 py-1.5 text-paper text-sm focus:outline-none focus:border-brass"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs">
          <span className="text-muted">Loan amount (₹)</span>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="8500000"
            className="bg-ink border border-line px-2 py-1.5 text-paper text-sm font-mono focus:outline-none focus:border-brass"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="mt-1 border border-brass text-brass hover:bg-brass hover:text-ink disabled:opacity-50 transition-colors text-sm font-medium py-1.5"
        >
          {saving ? "Saving to MongoDB..." : "Run collateral check & tag"}
        </button>
      </form>

      {pendingConflict && (
        <div className="border border-alert bg-alert/10 p-2.5 flex flex-col gap-2">
          <div className="text-alert text-xs font-semibold">
            ⚠ Collateral conflict — this ULPIN is not clean
          </div>

          <p className="text-xs text-paper/90">
            {unit.status === "disputed"
              ? "This unit carries an unresolved title dispute at the registry level."
              : `${activeMortgages.length} active lien(s) already tagged to ${ulpin}:`}
          </p>

          {activeMortgages.map((mortgage) => (
            <div
              key={mortgage.id}
              className="text-xs font-mono border border-line px-2 py-1"
            >
              {mortgage.bank} — {mortgage.loanId} — {formatINR(mortgage.amount)}{" "}
              — {mortgage.dateIssued}
            </div>
          ))}

          <div className="flex gap-2 mt-1">
            <button
              onClick={() => setPendingConflict(null)}
              disabled={saving}
              className="flex-1 border border-line text-muted text-xs py-1.5 hover:text-paper"
            >
              Cancel
            </button>

            <button
              onClick={() => register(pendingConflict)}
              disabled={saving}
              className="flex-1 border border-alert text-alert text-xs py-1.5 hover:bg-alert hover:text-ink disabled:opacity-50"
            >
              Register anyway (flagged override)
            </button>
          </div>
        </div>
      )}

      {confirmed && !pendingConflict && (
        <div className="border border-ok bg-ok/10 text-ok text-xs px-2.5 py-2">
          ✓ {confirmed.loanId} tagged to {ulpin} and saved to MongoDB.
        </div>
      )}

      {saveError && (
        <div className="border border-alert bg-alert/10 text-alert text-xs px-2.5 py-2">
          {saveError}
        </div>
      )}
    </div>
  );
}
