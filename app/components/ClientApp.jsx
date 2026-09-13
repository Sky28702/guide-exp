"use client";

import { useEffect, useMemo, useState } from "react";
import { IconPlus, IconLogout } from "@tabler/icons-react";

import {
  getCollateral,
  addMortgage,
  registerCollateral,
  clearCollateral,
} from "../actions/collateral";

import {
  createBuildingRequest,
  getMyBuildingRequests,
} from "../actions/BuildingRequest";

import TitleBlock from "./TitleBlock";
import SurfaceParcelMap from "./SurfaceParcelMap";
import BuildingPanel from "./BuildingPanel";
import Building3D from "./Building3D";
import UnitDetail from "./UnitDetail";
import MortgageForm from "./MortgageForm";
import CollateralRegister from "./CollateralRegister";
import AddBuilding from "./AddBuilding";
import RequestStatus from "./RequestStatus";

export default function ClientApp() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [collateral, setCollateral] = useState(null);
  const [requests, setRequests] = useState([]);

  const [showAddBuilding, setShowAddBuilding] = useState(false);

  const [selectedFloorId, setSelectedFloorId] = useState("F2");

  const [selectedUnitId, setSelectedUnitId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * ------------------------------------------------
   * LOAD AUTH USER
   * ------------------------------------------------
   */

  useEffect(() => {
    try {
      const loggedIn = localStorage.getItem("isLoggedIn");

      const storedUser = localStorage.getItem("authUser");

      if (loggedIn !== "true" || !storedUser) {
        setUser(null);
        setAuthChecked(true);
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(storedUser);

      setUser(parsedUser);
    } catch (err) {
      console.error("Failed to read auth user:", err);

      localStorage.removeItem("authUser");
      localStorage.removeItem("isLoggedIn");

      setUser(null);
    } finally {
      setAuthChecked(true);
    }
  }, []);

  /*
   * ------------------------------------------------
   * LOAD COLLATERAL + USER REQUESTS
   * ------------------------------------------------
   */

  useEffect(() => {
    if (!authChecked || !user) {
      return;
    }

    let alive = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const userId = user.id || user._id || user.employeeId || user.email;

        if (!userId) {
          throw new Error("Could not identify logged-in user.");
        }

        const [collateralData, requestData] = await Promise.all([
          getCollateral(),
          getMyBuildingRequests(userId),
        ]);

        if (!alive) return;

        setCollateral(collateralData);
        setRequests(requestData || []);
      } catch (err) {
        console.error(err);

        if (alive) {
          setError(err.message || "Failed to load application data");
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      alive = false;
    };
  }, [authChecked, user]);

  /*
   * ------------------------------------------------
   * COLLATERAL DATA
   * ------------------------------------------------
   */

  const floors = collateral?.floors || [];
  const parcel = collateral?.parcel || null;

  const selectedFloor = useMemo(
    () => floors.find((floor) => floor.id === selectedFloorId) || null,
    [floors, selectedFloorId],
  );

  const selectedUnit = useMemo(
    () =>
      selectedFloor?.units?.find((unit) => unit.id === selectedUnitId) || null,
    [selectedFloor, selectedUnitId],
  );

  /*
   * ------------------------------------------------
   * FLOOR / UNIT SELECTION
   * ------------------------------------------------
   */

  function handleSelectFloor(floorId) {
    setSelectedFloorId(floorId);
    setSelectedUnitId(null);
  }

  function handleSelectUnit(floorId, unitId) {
    setSelectedFloorId(floorId);
    setSelectedUnitId(unitId);
  }

  /*
   * ------------------------------------------------
   * MORTGAGE
   * ------------------------------------------------
   */

  async function handleAddMortgage(unitId, mortgage) {
    try {
      const updated = await addMortgage({
        unitId,
        mortgage,
      });

      setCollateral(updated);
    } catch (err) {
      console.error(err);

      setError(err.message || "Failed to add mortgage");
    }
  }

  /*
   * ------------------------------------------------
   * REGISTER COLLATERAL
   * ------------------------------------------------
   */

  async function handleRegisterCollateral(holderName) {
    if (!selectedUnit) return;

    try {
      const updated = await registerCollateral({
        unitId: selectedUnit.id,
        holderName,
      });

      setCollateral(updated);
    } catch (err) {
      console.error(err);

      setError(err.message || "Failed to register collateral");
    }
  }

  /*
   * ------------------------------------------------
   * CLEAR COLLATERAL
   * ------------------------------------------------
   */

  async function handleClearCollateral() {
    if (!selectedUnit) return;

    try {
      const updated = await clearCollateral(selectedUnit.id);

      setCollateral(updated);
    } catch (err) {
      console.error(err);

      setError(err.message || "Failed to clear collateral");
    }
  }

  /*
   * ------------------------------------------------
   * CREATE BUILDING REQUEST
   * ------------------------------------------------
   */

  async function handleCreateBuilding(data) {
    if (!user) {
      throw new Error("You must be logged in.");
    }

    const userId = user.id || user._id || user.employeeId || user.email;

    if (!userId) {
      throw new Error("Could not identify logged-in user.");
    }

    const request = await createBuildingRequest({
      ...data,
      userId,
    });

    setRequests((current) => [request, ...current]);

    setShowAddBuilding(false);
  }

  /*
   * ------------------------------------------------
   * AUTH CHECK
   * ------------------------------------------------
   */

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-muted">
        Checking authentication...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md border border-line bg-panel p-6 text-center">
          <p className="text-sm font-semibold text-paper">
            Authentication required
          </p>

          <p className="mt-2 text-xs text-muted">
            Please log in or create an account to access the building register.
          </p>

          <a
            href="/login"
            className="mt-5 inline-block border border-paper bg-paper px-5 py-2 text-xs font-semibold text-background"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  /*
   * ------------------------------------------------
   * LOADING
   * ------------------------------------------------
   */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-muted">
        Loading building register...
      </div>
    );
  }

  /*
   * ------------------------------------------------
   * ERROR
   * ------------------------------------------------
   */

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="border border-line bg-panel px-6 py-5">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  /*
   * ------------------------------------------------
   * NO COLLATERAL
   * ------------------------------------------------
   */

  if (!collateral) {
    return (
      <div className="min-h-screen pb-16">
        <TitleBlock parcel={null} selectedUnit={null} selectedFloor={null} />

        <main className="mx-auto max-w-350 px-4 md:px-6 mt-4">
          <div className="border border-line bg-panel p-6">
            <div className="flex items-center justify-between gap-3 border border-line bg-panel px-4 py-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
                  Building Registry
                </p>

                <p className="mt-1 text-sm text-paper">
                  Submit a building for survey and GIS processing.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <LogoutButton />

                <button
                  type="button"
                  onClick={() => setShowAddBuilding(true)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center border border-line text-paper transition hover:bg-paper hover:text-background"
                  title="Add building"
                  aria-label="Add building"
                >
                  <IconPlus size={18} stroke={1.5} />
                </button>
              </div>
            </div>

            <div className="mt-5">
              <RequestStatus requests={requests} />
            </div>
          </div>
        </main>

        {showAddBuilding && (
          <AddBuilding
            onClose={() => setShowAddBuilding(false)}
            onSubmit={handleCreateBuilding}
          />
        )}
      </div>
    );
  }

  /*
   * ------------------------------------------------
   * MAIN APPLICATION
   * ------------------------------------------------
   */

  return (
    <div className="min-h-screen pb-16">
      {/* HEADER */}

      <TitleBlock
        parcel={parcel}
        selectedUnit={selectedUnit}
        selectedFloor={selectedFloor}
      />

      {/* BUILDING REQUEST BAR */}

      <div className="mx-auto max-w-350 px-4 md:px-6 mt-4">
        <div className="flex flex-col gap-3">
          {/* TOP ACTION */}

          <div className="flex items-center justify-between gap-3 border border-line bg-panel px-4 py-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
                Building Registry
              </p>

              <p className="mt-1 text-sm text-paper">
                Submit a building for survey and GIS processing.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <LogoutButton />

              <button
                type="button"
                onClick={() => setShowAddBuilding(true)}
                className="flex h-9 w-9 shrink-0 items-center justify-center border border-line text-paper transition hover:bg-paper hover:text-background"
                title="Add building"
                aria-label="Add building"
              >
                <IconPlus size={18} stroke={1.5} />
              </button>
            </div>
          </div>

          {/* REQUEST STATUS */}

          <RequestStatus requests={requests} />
        </div>
      </div>

      {/* MAIN */}

      <main className="mx-auto max-w-350 px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        {/* LEFT */}

        <section className="lg:col-span-5 flex flex-col gap-4">
          {/* 01 */}

          <Panel
            title="01 — Surface Parcel"
            subtitle="GNSS-referenced footprint, GIS parcel layer"
          >
            <SurfaceParcelMap parcel={parcel} />
          </Panel>

          {/* 02 */}

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

        {/* RIGHT */}

        <section className="lg:col-span-7 flex flex-col gap-4">
          {/* 03 */}

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

          {/* 04 */}

          <Panel
            title="04 — Collateral Verification"
            subtitle="Bank-side lien check against the selected unit's 3D-ULPIN"
          >
            {selectedUnit ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-4">
                  <UnitDetail
                    floor={selectedFloor}
                    unit={selectedUnit}
                    parcel={parcel}
                  />

                  <CollateralRegister
                    unit={selectedUnit}
                    onRegister={handleRegisterCollateral}
                    onClear={handleClearCollateral}
                  />
                </div>

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

      {/* ADD BUILDING */}

      {showAddBuilding && (
        <AddBuilding
          onClose={() => setShowAddBuilding(false)}
          onSubmit={handleCreateBuilding}
        />
      )}
    </div>
  );
}

/*
 * ------------------------------------------------
 * LOGOUT BUTTON
 * ------------------------------------------------
 *
 * Uses the existing auth behavior.
 * Icon only so the top navigation stays compact.
 */

function LogoutButton() {
  const logout = () => {
    localStorage.removeItem("authUser");
    localStorage.removeItem("isLoggedIn");
    window.location.href = "/";
  };

  return (
    <button
      type="button"
      onClick={logout}
      title="Logout"
      aria-label="Logout"
      className="flex h-9 w-9 shrink-0 items-center justify-center border border-line text-paper transition hover:bg-paper hover:text-background"
    >
      <IconLogout size={17} stroke={1.5} />
    </button>
  );
}

/*
 * ------------------------------------------------
 * PANEL
 * ------------------------------------------------
 */

function Panel({ title, subtitle, children, grow = false }) {
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
