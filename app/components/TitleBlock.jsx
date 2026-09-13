export default function TitleBlock({ parcel, selectedFloor, selectedUnit }) {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  return (
    <header className="border-b border-line bg-panel">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-3 flex flex-col md:flex-row md:items-center gap-3 md:gap-8">
        <div>
          <h1 className="text-lg md:text-xl font-semibold leading-tight">
            3D ULPIN &amp; Vertical Property Mapping
          </h1>
          <p className="text-muted text-xs mt-0.5">
            Geospatial collateral verification prototype — {parcel.name}
          </p>
        </div>

        <div className="hidden lg:block h-10 w-px bg-line" />

        <div className="flex flex-wrap gap-x-8 gap-y-1 font-mono text-[11px] text-muted ml-auto">
          <Field label="Parcel ULPIN" value={parcel.ulpin} accent />
          <Field
            label="Site"
            value={parcel.address.split(",").slice(-2).join(",").trim()}
          />
          <Field label="Registry" value={parcel.registryStatus} />
          <Field label="Drawn" value={today} />
          {selectedFloor && (
            <Field
              label="Selection"
              value={
                selectedUnit
                  ? `${selectedFloor.id} / ${selectedUnit.code}`
                  : selectedFloor.id
              }
              accent
            />
          )}
        </div>
      </div>
    </header>
  );
}

function Field({ label, value, accent }) {
  return (
    <div className="flex flex-col leading-tight">
      <span className="text-[9px] uppercase tracking-[0.14em] text-muted/70">
        {label}
      </span>
      <span className={accent ? "text-brass" : "text-paper"}>{value}</span>
    </div>
  );
}
