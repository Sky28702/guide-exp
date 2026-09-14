import { unitUlpin, formatINR } from "../lib/ulpin";

const STATUS_LABEL = {
  owned: { text: "Owned", color: "text-paper" },
  vacant: { text: "Vacant / Unmortgaged", color: "text-ok" },
  disputed: { text: "Title Disputed", color: "text-alert" },
};

export default function UnitDetail({ parcel, floor, unit }) {
  const status = STATUS_LABEL[unit.status];
  const ulpin = unitUlpin(parcel, floor, unit);

  return (
    <div className="border border-line p-3 flex flex-col gap-3">
      <div>
        <div className="text-[13px] uppercase tracking-[0.14em] text-muted">
          3D-ULPIN
        </div>
        <div className="font-mono text-brass text-base leading-tight break-all">
          {ulpin}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[13px]">
        <Row label="Floor" value={floor.label} />
        <Row label="Unit" value={`${unit.code} · ${unit.type}`} />
        <Row label="Area" value={`${unit.area} sq m`} />
        <Row label="Owner of record" value={unit.owner ?? "— unassigned —"} />
        <Row label="Status" value={status.text} valueClass={status.color} />
      </dl>

      {unit.status === "disputed" && (
        <div className="border border-alert/50 bg-alert/10 text-alert text-[13px] px-2.5 py-2">
          {unit.disputeNote}
        </div>
      )}

      <div>
        <div className="text-[13px] uppercase tracking-[0.14em] text-muted mb-1.5">
          Registered liens ({unit.mortgages.length})
        </div>

        {unit.mortgages.length === 0 ? (
          <div className="text-[13px] text-muted">
            No mortgage currently tagged to this ULPIN.
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {unit.mortgages.map((mortgage) => (
              <li
                key={mortgage.id}
                className="border border-line px-2.5 py-1.5 text-[13px]"
              >
                <div className="flex justify-between">
                  <span className="font-medium">{mortgage.bank}</span>
                  <span className="font-mono text-muted">
                    {mortgage.dateIssued}
                  </span>
                </div>
                <div className="flex justify-between text-muted mt-0.5">
                  <span className="font-mono">{mortgage.loanId}</span>
                  <span className="font-mono text-paper">
                    {formatINR(mortgage.amount)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, valueClass }) {
  return (
    <>
      <dt className="text-muted">{label}</dt>
      <dd className={`text-right font-medium ${valueClass ?? ""}`}>{value}</dd>
    </>
  );
}
