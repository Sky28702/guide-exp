"use client";

import { useState } from "react";

const MAX_HOLDER_NAME_LENGTH = 50;

function sanitizeHolderName(value) {
  return value
    .replace(/[^A-Za-z ]/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^\s+/, "")
    .slice(0, MAX_HOLDER_NAME_LENGTH);
}

function isValidHolderName(value) {
  return /^[A-Za-z]+(?: [A-Za-z]+)*$/.test(value);
}

export default function CollateralRegister({ unit, onRegister, onClear }) {
  const [holderName, setHolderName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!unit) {
    return null;
  }

  const holder = unit.collateralHolder;
  const status = unit.collateralStatus || "CLEAR";

  function handleNameChange(event) {
    setHolderName(sanitizeHolderName(event.target.value));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const name = holderName.trim();

    if (!name) {
      setError("Enter a name.");
      return;
    }

    if (name.length > MAX_HOLDER_NAME_LENGTH) {
      setError(`Name cannot exceed ${MAX_HOLDER_NAME_LENGTH} characters.`);
      return;
    }

    if (!isValidHolderName(name)) {
      setError("Name can contain alphabets and spaces only.");
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
          <p className="text-[13px] uppercase tracking-[0.16em] text-muted">
            Collateral
          </p>

          <p className="mt-1 text-[15px] font-semibold text-paper">
            {unit.code || unit.id}
          </p>
        </div>

        <span
          className={`text-[13px] font-mono ${
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
            <p className="text-[13px] uppercase tracking-wider text-muted">
              Registered Against
            </p>

            <p className="mt-1 text-[15px] font-semibold text-paper">
              {holder.name}
            </p>

            {holder.registeredAt && (
              <p className="mt-1 text-[13px] text-muted font-mono">
                Registered {new Date(holder.registeredAt).toLocaleDateString()}
              </p>
            )}

            <button
              type="button"
              onClick={handleClear}
              disabled={saving}
              className="mt-3 w-full border border-red-300 px-3 py-2 text-[13px] text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Clearing..." : "Clear Collateral"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="text-[13px] text-muted">
              Register collateral against
            </label>

            <input
              type="text"
              value={holderName}
              onChange={handleNameChange}
              maxLength={MAX_HOLDER_NAME_LENGTH}
              autoComplete="name"
              placeholder="Person / entity name"
              className="mt-2 w-full border border-line bg-transparent px-3 py-2 text-[14px] text-paper outline-none focus:border-paper"
            />

            <div className="mt-1 flex justify-between text-[12px] text-muted">
              <span>Alphabets and spaces only</span>

              <span>
                {holderName.length}/{MAX_HOLDER_NAME_LENGTH}
              </span>
            </div>

            <button
              type="submit"
              disabled={saving || !holderName.trim()}
              className="mt-3 w-full border border-paper bg-paper px-4 py-2 text-[13px] font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Registering..." : "Register Collateral"}
            </button>
          </form>
        )}

        {error && <p className="mt-2 text-[13px] text-red-500">{error}</p>}
      </div>
    </div>
  );
}
