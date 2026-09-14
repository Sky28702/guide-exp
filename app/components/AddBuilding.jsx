"use client";

import { useState } from "react";

export default function AddBuilding({ onSubmit, onClose }) {
  const [form, setForm] = useState({
    buildingName: "",
    buildingId: "",
    ulpin: "",
    address: "",
    city: "",
    state: "",
    latitude: "",
    longitude: "",
    parcelArea: "",
    floors: "",
    floorHeight: "",
    buildingHeight: "",
    owner: "",
  });

  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);

      await onSubmit({
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        parcelArea: form.parcelArea ? Number(form.parcelArea) : null,
        floors: form.floors ? Number(form.floors) : 1,
        floorHeight: form.floorHeight ? Number(form.floorHeight) : null,
        buildingHeight: form.buildingHeight
          ? Number(form.buildingHeight)
          : null,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/30 rounded-2xl">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-2xl">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
              New Request
            </p>

            <h2 className="mt-1 text-lg font-semibold text-paper">
              Add Building
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xl text-muted transition hover:text-paper"
          >
            ×
          </button>
        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-5">
          {/* PROPERTY */}

          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-paper">
              Property
            </p>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field
                label="Building Name"
                value={form.buildingName}
                onChange={(value) => update("buildingName", value)}
                required
              />

              <Field
                label="Building ID"
                value={form.buildingId}
                onChange={(value) => update("buildingId", value)}
                required
              />

              <Field
                label="ULPIN / Parcel ID"
                value={form.ulpin}
                onChange={(value) => update("ulpin", value)}
              />

              <Field
                label="Owner"
                value={form.owner}
                onChange={(value) => update("owner", value)}
              />
            </div>

            <div className="mt-3">
              <Field
                label="Address"
                value={form.address}
                onChange={(value) => update("address", value)}
                required
              />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field
                label="City"
                value={form.city}
                onChange={(value) => update("city", value)}
                required
              />

              <Field
                label="State / Province"
                value={form.state}
                onChange={(value) => update("state", value)}
                required
              />
            </div>
          </section>

          {/* SURFACE PARCEL */}

          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-paper">
              Surface Parcel
            </p>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field
                label="Latitude"
                type="number"
                step="any"
                value={form.latitude}
                onChange={(value) => update("latitude", value)}
                required
              />

              <Field
                label="Longitude"
                type="number"
                step="any"
                value={form.longitude}
                onChange={(value) => update("longitude", value)}
                required
              />

              <Field
                label="Parcel Area (m²)"
                type="number"
                step="any"
                value={form.parcelArea}
                onChange={(value) => update("parcelArea", value)}
              />
            </div>

            <div className="mt-3 border border-dashed border-line bg-background/40 p-4 text-center text-xs text-muted">
              Parcel boundary will be added by the survey / GIS process.
            </div>
          </section>

          {/* STRUCTURE */}

          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-paper">
              Structure
            </p>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Field
                label="Floors"
                type="number"
                min="1"
                value={form.floors}
                onChange={(value) => update("floors", value)}
              />

              <Field
                label="Floor Height (m)"
                type="number"
                step="any"
                value={form.floorHeight}
                onChange={(value) => update("floorHeight", value)}
              />

              <Field
                label="Building Height (m)"
                type="number"
                step="any"
                value={form.buildingHeight}
                onChange={(value) => update("buildingHeight", value)}
              />
            </div>
          </section>

          {/* ACTIONS */}

          <div className="flex justify-end gap-3 border-t border-line pt-4">
            <button
              type="button"
              onClick={onClose}
              className="border border-line px-4 py-2 text-xs text-muted transition hover:bg-background hover:text-paper"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="bg-paper px-5 py-2 text-xs font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  step,
  min,
  required = false,
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-muted">
        {label}
      </span>

      <input
        type={type}
        step={step}
        min={min}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-900"
      />
    </label>
  );
}
//builds
