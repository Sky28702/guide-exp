const STATUS_STYLE = {
  owned: "border-line text-paper",
  vacant: "border-ok text-ok",
  disputed: "border-alert text-alert"
};

export default function BuildingPanel({
  floors,
  selectedFloorId,
  selectedUnitId,
  onSelectFloor,
  onSelectUnit
}) {
  const ordered = [...floors].reverse();

  return (
    <div className="flex flex-col border border-line divide-y divide-line">
      {ordered.map((floor) => {
        const isSelected = floor.id === selectedFloorId;

        return (
          <div
            key={floor.id}
            className={isSelected ? "bg-panel2" : "bg-panel"}
          >
            <button
              onClick={() => onSelectFloor(floor.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-panel2 transition-colors ${
                isSelected ? "text-brass" : "text-paper"
              }`}
            >
              <span className="flex items-baseline gap-2">
                <span className="font-mono text-[13px] text-muted">
                  {floor.id.padStart(2, "0")}
                </span>
                <span className="text-sm font-medium">{floor.label}</span>
              </span>
              <span className="text-[13px] text-muted font-mono">
                {floor.sublabel}
              </span>
            </button>

            {isSelected && floor.kind === "residential" && (
              <div className="px-3 pb-3">
                <UnitRow
                  units={floor.units.filter((u) => u.side === "North")}
                  floorId={floor.id}
                  selectedUnitId={selectedUnitId}
                  onSelectUnit={onSelectUnit}
                />

                <div className="my-1.5 h-4 flex items-center justify-center">
                  <span className="text-[13px] uppercase tracking-[0.14em] text-muted/60 border-t border-dashed border-line w-full text-center pt-1">
                    corridor
                  </span>
                </div>

                <UnitRow
                  units={floor.units.filter((u) => u.side === "South")}
                  floorId={floor.id}
                  selectedUnitId={selectedUnitId}
                  onSelectUnit={onSelectUnit}
                />
              </div>
            )}

            {isSelected && floor.kind === "parking" && (
              <div className="px-3 pb-3 text-[13px] text-muted font-mono">
                {floor.capacity} bays · not individually parcelled in this prototype
              </div>
            )}

            {isSelected && floor.kind === "lobby" && (
              <div className="px-3 pb-3 text-[13px] text-muted font-mono">
                Common area — no mortgageable units
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function UnitRow({ units, floorId, selectedUnitId, onSelectUnit }) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {units.map((unit) => {
        const isSelected = unit.id === selectedUnitId;
        const hasMortgage = unit.mortgages.length > 0;

        return (
          <button
            key={unit.id}
            onClick={() => onSelectUnit(floorId, unit.id)}
            className={`relative border px-2 py-2 text-left transition-colors ${
              STATUS_STYLE[unit.status]
            } ${
              isSelected
                ? "bg-brass/10 border-brass text-brass"
                : "hover:bg-panel2"
            }`}
          >
            {hasMortgage && (
              <span
                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brass"
                title="Active mortgage on record"
              />
            )}
            <div className="text-[13px] font-mono">{unit.code}</div>
            <div className="text-[13px] text-muted">{unit.type}</div>
          </button>
        );
      })}
    </div>
  );
}
