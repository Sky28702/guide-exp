"use client";

import { useState } from "react";

export default function RequestStatus({ requests }) {
  const [open, setOpen] = useState(true);

  return (
    <section className="border border-line bg-panel">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between border-b border-line px-4 py-3 text-left"
      >
        <div>
          <p className="text-[13px] uppercase tracking-[0.16em] text-muted">
            Building Requests
          </p>

          <p className="mt-1 text-sm font-semibold text-paper">
            {requests.length} request
            {requests.length !== 1 ? "s" : ""}
          </p>
        </div>

        <span className="text-muted">{open ? "⌃" : "⌄"}</span>
      </button>

      {open && (
        <div className="divide-y divide-line">
          {requests.length === 0 ? (
            <div className="px-4 py-8 text-center text-[13px] text-muted">
              No building requests yet.
            </div>
          ) : (
            requests.map((request) => (
              <Request key={request._id} request={request} />
            ))
          )}
        </div>
      )}
    </section>
  );
}

function Request({ request }) {
  const done = request.surfaceParcelStatus === "DONE";

  return (
    <div className="px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-paper">
            {request.buildingName}
          </p>

          <p className="mt-1 text-[13px] font-mono text-muted">
            {request.buildingId}
          </p>
        </div>

        <span
          className={`text-[13px] font-mono ${
            done ? "text-green-600" : "text-amber-600"
          }`}
        >
          {done ? "DONE" : "PENDING"}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <StatusItem label="Surface Parcel" done={done} />

        <StatusItem label="Building Data" done={request.status === "DONE"} />
      </div>

      <p className="mt-3 text-[13px] text-muted">{request.address}</p>
    </div>
  );
}

function StatusItem({ label, done }) {
  return (
    <div className="border border-line px-3 py-2">
      <p className="text-[13px] uppercase tracking-wider text-muted">{label}</p>

      <p
        className={`mt-1 text-[13px] font-mono ${
          done ? "text-green-600" : "text-muted"
        }`}
      >
        {done ? "DONE" : "YET TO BE DONE"}
      </p>
    </div>
  );
}
