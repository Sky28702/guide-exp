"use client";

import { useState } from "react";

export default function CollateralRegister({ unit, onRegister, onClear }) {
  const [holderName, setHolderName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!unit) {
    return null;
  }

  const holder = unit.collateralHolder;
  const status = unit.collateralStatus || "CLEAR";

  async function handleSubmit(event) {
    event.preventDefault();

    const name = holderName.trim();

    if (!name) {
      setError("Enter a name");
      return;
    }

    try {
      setError("");
      setSaving(true);

      await onRegister(name);

      setHolderName("");
    } catch (err) {
      console.error(err);

      setError(err.message || "Failed to register collateral");
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    try {
      setError("");
      setSaving(true);

      await onClear();
    } catch (err) {
      console.error(err);

      setError(err.message || "Failed to clear collateral");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-line bg-panel p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
            Collateral
          </p>

          <p className="mt-1 text-sm font-semibold text-paper">
            {unit.code || unit.id}
          </p>
        </div>

        <span
          className={`text-[10px] font-mono ${
            status === "CLEAR"
              ? "text-green-600"
              : status === "ENCUMBERED"
                ? "text-red-600"
                : "text-amber-600"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="mt-4">
        {holder?.name ? (
          <div className="border border-line p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted">
              Registered Against
            </p>

            <p className="mt-1 text-sm font-semibold text-paper">
              {holder.name}
            </p>

            {holder.registeredAt && (
              <p className="mt-1 text-[10px] text-muted font-mono">
                Registered {new Date(holder.registeredAt).toLocaleDateString()}
              </p>
            )}

            <button
              type="button"
              onClick={handleClear}
              disabled={saving}
              className="mt-3 w-full border border-red-300 px-3 py-2 text-xs text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Clearing..." : "Clear Collateral"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="text-xs text-muted">
              Register collateral against
            </label>

            <input
              type="text"
              value={holderName}
              onChange={(event) => setHolderName(event.target.value)}
              placeholder="Person / entity name"
              className="mt-2 w-full border border-line bg-transparent px-3 py-2 text-sm text-paper outline-none focus:border-paper"
            />

            <button
              type="submit"
              disabled={saving || !holderName.trim()}
              className="mt-3 w-full border border-paper bg-paper px-4 py-2 text-xs font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Registering..." : "Register Collateral"}
            </button>
          </form>
        )}

        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}
