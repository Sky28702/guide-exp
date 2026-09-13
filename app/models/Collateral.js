import mongoose from "mongoose";

const MortgageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    bank: { type: String, required: true },
    loanId: { type: String, required: true },
    amount: { type: Number, required: true },
    dateIssued: { type: String, required: true },
    status: { type: String, default: "active" },
    borrower: { type: String, default: "" }
  },
  { _id: false }
);

const UnitSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    code: { type: String, required: true },
    type: { type: String, required: true },
    area: { type: Number, required: true },
    bounds: {
      x: { type: [Number], required: true },
      y: { type: [Number], required: true }
    },
    side: { type: String, required: true },
    owner: { type: String, default: null },
    status: {
      type: String,
      enum: ["owned", "vacant", "disputed"],
      default: "owned"
    },
    disputeNote: { type: String, default: "" },
    mortgages: { type: [MortgageSchema], default: [] }
  },
  { _id: false }
);

const FloorSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    sublabel: { type: String, required: true },
    kind: { type: String, required: true },
    z: { type: [Number], required: true },
    units: { type: [UnitSchema], default: [] },
    capacity: { type: Number, default: null }
  },
  { _id: false }
);

const CollateralSchema = new mongoose.Schema(
  {
    parcel: {
      id: { type: String, required: true },
      ulpin: { type: String, required: true },
      name: { type: String, required: true },
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      footprint: {
        length: { type: Number, required: true },
        width: { type: Number, required: true }
      },
      registryStatus: { type: String, required: true }
    },
    structure: {
      columnGrid: {
        xs: { type: [Number], default: [] },
        ys: { type: [Number], default: [] }
      },
      cores: { type: [mongoose.Schema.Types.Mixed], default: [] },
      corridor: { type: mongoose.Schema.Types.Mixed, default: null },
      levels: { type: mongoose.Schema.Types.Mixed, default: null }
    },
    floors: { type: [FloorSchema], default: [] },
    banks: { type: [String], default: [] }
  },
  { timestamps: true }
);

export default mongoose.models.Collateral ||
  mongoose.model("Collateral", CollateralSchema);
