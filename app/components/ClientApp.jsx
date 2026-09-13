"use client";

import { useEffect, useMemo, useState } from "react";

import { getCollateral, addMortgage } from "../actions/collateral";

import TitleBlock from "./TitleBlock";
import MapView from "./MapView";
import SurfaceParcelMap from "./SurfaceParcelMap";
import BuildingPanel from "./BuildingPanel";
import Building3D from "./Building3D";
import UnitDetail from "./UnitDetail";
import MortgageForm from "./MortgageForm";

export default function ClientApp() {
  const [collateral, setCollateral] = useState(null);

  const [selectedFloorId, setSelectedFloorId] = useState("F2");
  const [selectedUnitId, setSelectedUnitId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const data = await getCollateral();

        if (alive) {
          setCollateral(data);
        }
      } catch (err) {
        console.error(err);

        if (alive) {
          setError(err.message || "Failed to load collateral data");
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  const floors = collateral?.floors || [];
  const parcel = collateral?.parcel || null;

  const selectedFloor = useMemo(
    () => floors.find((floor) => floor.id === selectedFloorId) || null,
    [floors, selectedFloorId],
  );

  const selectedUnit = useMemo(
    () =>
      selectedFloor?.units.find((unit) => unit.id === selectedUnitId) || null,
    [selectedFloor, selectedUnitId],
  );

  function handleSelectFloor(floorId) {
    setSelectedFloorId(floorId);
    setSelectedUnitId(null);
  }

  function handleSelectUnit(floorId, unitId) {
    setSelectedFloorId(floorId);
    setSelectedUnitId(unitId);
  }

  async function handleAddMortgage(unitId, mortgage) {
    const updated = await addMortgage({
      unitId,
      mortgage,
    });

    setCollateral(updated);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-muted">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="border border-line bg-panel px-6 py-5 text-sm text-red-500">
          Something went wrong while loading the application.
        </div>
      </div>
    );
  }

  if (!collateral || !parcel) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="border border-line bg-panel px-6 py-5 text-sm text-muted">
          No parcel data available.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <TitleBlock
        parcel={parcel}
        selectedUnit={selectedUnit}
        selectedFloor={selectedFloor}
      />

      <main className="mx-auto max-w-350 px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        {/* LEFT SIDE */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          {/* 01 — SURFACE PARCEL */}
          <Panel
            title="01 — Surface Parcel"
            subtitle="GNSS-referenced footprint, GIS parcel layer"
          >
            <SurfaceParcelMap parcel={parcel} />
          </Panel>

          {/* 02 — VERTICAL REGISTER */}
          <Panel
            title="02 — Vertical Register"
            subtitle="Floor-by-floor unit ledger — click a unit to inspect its ULPIN"
          >
            <BuildingPanel
              floors={floors}
              selectedFloorId={selectedFloorId}
              selectedUnitId={selectedUnitId}
              onSelectFloor={handleSelectFloor}
              onSelectUnit={handleSelectUnit}
            />
          </Panel>
        </section>

        {/* RIGHT SIDE */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          {/* 03 — 3D MODEL */}
          <Panel
            title="03 — Volumetric Cadastre Model"
            subtitle="Greybox extraction from floor plan + column grid — drag to orbit, scroll to zoom"
            grow
          >
            <Building3D
              floors={floors}
              structure={collateral.structure}
              selectedFloorId={selectedFloorId}
              selectedUnitId={selectedUnitId}
              onSelectFloor={handleSelectFloor}
              onSelectUnit={handleSelectUnit}
            />
          </Panel>

          {/* 04 — COLLATERAL */}
          <Panel
            title="04 — Collateral Verification"
            subtitle="Bank-side lien check against the selected unit's 3D-ULPIN"
          >
            {selectedUnit ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UnitDetail
                  floor={selectedFloor}
                  unit={selectedUnit}
                  parcel={parcel}
                />

                <MortgageForm
                  floor={selectedFloor}
                  unit={selectedUnit}
                  parcel={parcel}
                  banks={collateral.banks}
                  onAddMortgage={(mortgage) =>
                    handleAddMortgage(selectedUnit.id, mortgage)
                  }
                />
              </div>
            ) : (
              <div className="text-muted text-sm py-10 text-center border border-dashed border-line">
                Select a unit from the vertical register or the 3D model to run
                a collateral check against its ULPIN.
              </div>
            )}
          </Panel>
        </section>
      </main>
    </div>
  );
}

function Panel({ title, subtitle, children, grow }) {
  return (
    <div
      className={`border border-line bg-panel ${
        grow ? "flex-1 flex flex-col" : ""
      }`}
    >
      <div className="px-4 py-2.5 border-b border-line flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-semibold tracking-wide text-paper">
          {title}
        </h2>

        <span className="text-[11px] text-muted font-mono hidden sm:block">
          {subtitle}
        </span>
      </div>

      <div className={`p-3 ${grow ? "flex-1 flex flex-col" : ""}`}>
        {children}
      </div>
    </div>
  );
}
