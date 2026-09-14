"use client";

import { useState } from "react";
import { unitUlpin, formatINR } from "../lib/ulpin";

const MAX_BORROWER_LENGTH = 50;
const MAX_LOAN_DIGITS = 12;

/*
  Borrower name:
  - A-Z / a-z only
  - spaces allowed
  - maximum 50 characters
*/
function sanitizeBorrowerName(value) {
  return value
    .replace(/[^A-Za-z ]/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^\s+/, "")
    .slice(0, MAX_BORROWER_LENGTH);
}

function isValidBorrowerName(value) {
  return /^[A-Za-z]+(?: [A-Za-z]+)*$/.test(value);
}

/*
  Loan amount:
  - digits only
  - no + / - / decimal / exponent
  - maximum 12 digits
*/
function sanitizeLoanAmount(value) {
  return value.replace(/\D/g, "").slice(0, MAX_LOAN_DIGITS);
}

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

  function buildDraft(cleanBorrower) {
    const bankCode =
      bank
        .replace(/[^A-Za-z0-9]/g, "")
        .slice(0, 12)
        .toUpperCase() || "BANK";

    return {
      id: `MTG-${bankCode}-${Math.floor(1000 + Math.random() * 9000)}`,

      bank,

      loanId: `${bankCode}-LN-${Math.floor(10000 + Math.random() * 89999)}`,

      amount: Number(amount),

      dateIssued: new Date().toISOString().slice(0, 10),

      status: "active",

      borrower: cleanBorrower,
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

  function handleBorrowerChange(event) {
    setBorrower(sanitizeBorrowerName(event.target.value));
    setSaveError("");
    setConfirmed(null);
  }

  function handleAmountChange(event) {
    setAmount(sanitizeLoanAmount(event.target.value));
    setSaveError("");
    setConfirmed(null);
  }

  function handleSubmit(event) {
    event.preventDefault();

    setConfirmed(null);
    setSaveError("");

    const cleanBorrower = borrower.trim();
    const numericAmount = Number(amount);

    if (!cleanBorrower) {
      setSaveError("Borrower name is required.");
      return;
    }

    if (cleanBorrower.length > MAX_BORROWER_LENGTH) {
      setSaveError(
        `Borrower name cannot exceed ${MAX_BORROWER_LENGTH} characters.`,
      );
      return;
    }

    if (!isValidBorrowerName(cleanBorrower)) {
      setSaveError("Borrower name can contain alphabets and spaces only.");
      return;
    }

    if (!amount) {
      setSaveError("Enter a loan amount.");
      return;
    }

    if (!/^\d+$/.test(amount)) {
      setSaveError("Loan amount must contain digits only.");
      return;
    }

    if (numericAmount <= 0 || !Number.isSafeInteger(numericAmount)) {
      setSaveError("Enter a valid loan amount.");
      return;
    }

    const draft = buildDraft(cleanBorrower);

    if (unit.status === "disputed" || activeMortgages.length > 0) {
      setPendingConflict(draft);
      return;
    }

    register(draft);
  }

  return (
    <div className="border border-line p-3 flex flex-col gap-3">
      <div className="text-[13px] uppercase tracking-[0.14em] text-muted">
        Tag New Mortgage — {ulpin}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <label className="flex flex-col gap-1 text-[13px]">
          <span className="text-muted">Lending institution</span>

          <select
            value={bank}
            onChange={(event) => setBank(event.target.value)}
            className="bg-ink border border-line px-2 py-1.5 text-paper text-[14px] focus:outline-none focus:border-brass"
          >
            {banks.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-[13px]">
          <span className="text-muted">
            Borrower name
            <span className="ml-1 opacity-60">
              ({borrower.length}/{MAX_BORROWER_LENGTH})
            </span>
          </span>

          <input
            type="text"
            value={borrower}
            onChange={handleBorrowerChange}
            maxLength={MAX_BORROWER_LENGTH}
            autoComplete="name"
            placeholder="e.g. Rohit Sharma"
            className="bg-ink border border-line px-2 py-1.5 text-paper text-[14px] focus:outline-none focus:border-brass"
          />

          <span className="text-[12px] text-muted">
            Alphabets and spaces only
          </span>
        </label>

        <label className="flex flex-col gap-1 text-[13px]">
          <span className="text-muted">Loan amount (₹)</span>

          <input
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={handleAmountChange}
            maxLength={MAX_LOAN_DIGITS}
            placeholder="8500000"
            className="bg-ink border border-line px-2 py-1.5 text-paper text-[14px] font-mono focus:outline-none focus:border-brass"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="mt-1 border border-brass text-brass hover:bg-brass hover:text-ink disabled:opacity-50 transition-colors text-[14px] font-medium py-1.5"
        >
          {saving ? "Saving to MongoDB..." : "Run collateral check & tag"}
        </button>
      </form>

      {pendingConflict && (
        <div className="border border-alert bg-alert/10 p-2.5 flex flex-col gap-2">
          <div className="text-alert text-[13px] font-semibold">
            ⚠ Collateral conflict — this ULPIN is not clean
          </div>

          <p className="text-[13px] text-paper/90">
            {unit.status === "disputed"
              ? "This unit carries an unresolved title dispute at the registry level."
              : `${activeMortgages.length} active lien(s) already tagged to ${ulpin}:`}
          </p>

          {activeMortgages.map((mortgage) => (
            <div
              key={mortgage.id}
              className="text-[13px] font-mono border border-line px-2 py-1"
            >
              {mortgage.bank} — {mortgage.loanId} — {formatINR(mortgage.amount)}{" "}
              — {mortgage.dateIssued}
            </div>
          ))}

          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={() => setPendingConflict(null)}
              disabled={saving}
              className="flex-1 border border-line text-muted text-[13px] py-1.5 hover:text-paper"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => register(pendingConflict)}
              disabled={saving}
              className="flex-1 border border-alert text-alert text-[13px] py-1.5 hover:bg-alert hover:text-ink disabled:opacity-50"
            >
              Register anyway (flagged override)
            </button>
          </div>
        </div>
      )}

      {confirmed && !pendingConflict && (
        <div className="border border-ok bg-ok/10 text-ok text-[13px] px-2.5 py-2">
          ✓ {confirmed.loanId} tagged to {ulpin} and saved to MongoDB.
        </div>
      )}

      {saveError && (
        <div className="border border-alert bg-alert/10 text-alert text-[13px] px-2.5 py-2">
          {saveError}
        </div>
      )}
    </div>
  );
}
