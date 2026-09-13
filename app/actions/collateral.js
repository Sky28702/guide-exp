"use server";

import connectDB from "../lib/mongodb";
import Collateral from "../models/Collateral";

const parcel = {
  id: "DL-CP-0142",
  ulpin: "284710530142",
  name: "Meridian Residency",
  address: "Block C, Barakhamba Road, Connaught Place, New Delhi",
  lat: 28.6315,
  lng: 77.2167,
  footprint: { length: 54, width: 20 },
  registryStatus: "Verified — DORIS + DLR cross-matched",
};

const structure = {
  columnGrid: {
    xs: [0, 6, 12, 18, 24, 30, 36, 42, 48, 54],
    ys: [0, 6.5, 13.5, 20],
  },
  cores: [
    {
      id: "core-west",
      label: "Stairwell A + Elevators",
      x: [6, 12],
      y: [7, 13],
    },
    {
      id: "core-east",
      label: "Stairwell B (Fire Exit)",
      x: [48, 52],
      y: [8.5, 11.5],
    },
  ],
  corridor: { x: [0, 54], y: [8.5, 11.5] },
  levels: {
    basement: { z: [-3.5, 0], label: "Basement — Parking" },
    ground: { z: [0, 3.5], label: "Ground — Lobby & Amenities" },
    typical: { height: 3.5 },
  },
};

const banks = [
  "HDFC Bank",
  "State Bank of India",
  "ICICI Bank",
  "Axis Bank",
  "Punjab National Bank",
  "Kotak Mahindra Bank",
];

const aptTemplate = [
  {
    code: "N1",
    type: "2BHK",
    area: 153,
    x: [0, 18],
    y: [11.5, 20],
    side: "North",
  },
  {
    code: "N2",
    type: "2BHK",
    area: 153,
    x: [18, 36],
    y: [11.5, 20],
    side: "North",
  },
  {
    code: "N3",
    type: "2BHK",
    area: 153,
    x: [36, 54],
    y: [11.5, 20],
    side: "North",
  },
  {
    code: "S1",
    type: "3BHK",
    area: 153,
    x: [0, 18],
    y: [0, 8.5],
    side: "South",
  },
  {
    code: "S2",
    type: "3BHK",
    area: 153,
    x: [18, 36],
    y: [0, 8.5],
    side: "South",
  },
  {
    code: "S3",
    type: "3BHK",
    area: 153,
    x: [36, 54],
    y: [0, 8.5],
    side: "South",
  },
];

const owners = [
  "Rohit Sharma",
  "Anjali Mehta",
  "Vikram Nair",
  "Sana Qureshi",
  "Arjun Kapoor",
  "Priya Iyer",
  "Karan Bedi",
  "Neha Choudhary",
  "Farhan Ali",
  "Divya Rao",
  "Suresh Menon",
  "Kavita Joshi",
  "Amit Kulkarni",
  "Ritu Malhotra",
  "Deepak Verma",
  "Shreya Pillai",
  "Manoj Tiwari",
  "Lakshmi Nair",
  "Rahul Saxena",
  "Pooja Bhatt",
  "Imran Sheikh",
  "Sunita Reddy",
  "Gaurav Sethi",
  "Meera Krishnan",
];

function createInitialFloors() {
  let ownerIndex = 0;

  const makeFloorUnits = (floorId) =>
    aptTemplate.map((apt) => ({
      id: `${floorId}-${apt.code}`,
      code: apt.code,
      type: apt.type,
      area: apt.area,
      bounds: { x: apt.x, y: apt.y },
      side: apt.side,
      owner: owners[ownerIndex++ % owners.length],
      status: "owned",
      disputeNote: "",
      mortgages: [],
    }));

  const F1 = makeFloorUnits("F1");
  const F2 = makeFloorUnits("F2");
  const F3 = makeFloorUnits("F3");
  const F4 = makeFloorUnits("F4");

  F2.find((u) => u.code === "S2").mortgages.push({
    id: "MTG-HDFC-88213",
    bank: "HDFC Bank",
    loanId: "HDFC-LN-88213",
    amount: 8500000,
    dateIssued: "2023-04-12",
    status: "active",
    borrower: "",
  });

  F3.find((u) => u.code === "N1").mortgages.push({
    id: "MTG-SBI-55021",
    bank: "State Bank of India",
    loanId: "SBI-LN-55021",
    amount: 6200000,
    dateIssued: "2022-11-03",
    status: "active",
    borrower: "",
  });

  const disputed = F4.find((u) => u.code === "S3");
  disputed.status = "disputed";
  disputed.disputeNote =
    "Conflicting inheritance claim under review by Sub-Registrar, Delhi.";

  const vacant = F1.find((u) => u.code === "N3");
  vacant.status = "vacant";
  vacant.owner = null;

  return [
    {
      id: "B",
      label: "Basement",
      sublabel: "Parking — 30 bays",
      kind: "parking",
      z: structure.levels.basement.z,
      units: [],
      capacity: 30,
    },
    {
      id: "G",
      label: "Ground Floor",
      sublabel: "Lobby & amenities",
      kind: "lobby",
      z: structure.levels.ground.z,
      units: [],
    },
    {
      id: "F1",
      label: "Floor 1",
      sublabel: "6 units",
      kind: "residential",
      z: [3.5, 7],
      units: F1,
    },
    {
      id: "F2",
      label: "Floor 2",
      sublabel: "6 units",
      kind: "residential",
      z: [7, 10.5],
      units: F2,
    },
    {
      id: "F3",
      label: "Floor 3",
      sublabel: "6 units",
      kind: "residential",
      z: [10.5, 14],
      units: F3,
    },
    {
      id: "F4",
      label: "Floor 4",
      sublabel: "6 units",
      kind: "residential",
      z: [14, 17.5],
      units: F4,
    },
  ];
}

function toPlain(doc) {
  return JSON.parse(JSON.stringify(doc));
}

export async function getCollateral() {
  await connectDB();

  let collateral = await Collateral.findOne({
    "parcel.id": parcel.id,
  }).lean();

  // No record yet → create the default collateral record
  if (!collateral) {
    collateral = await Collateral.create({
      parcel,
      structure,
      floors: createInitialFloors(),
      banks,
    });
  }

  return JSON.parse(JSON.stringify(collateral));
}

export async function addMortgage({ unitId, mortgage }) {
  if (!unitId || !mortgage) {
    throw new Error("unitId and mortgage are required");
  }

  await connectDB();

  const collateral = await Collateral.findOne({ "parcel.id": parcel.id });

  if (!collateral) {
    throw new Error("Collateral record not found");
  }

  let found = false;

  for (const floor of collateral.floors) {
    const unit = floor.units.find((item) => item.id === unitId);

    if (unit) {
      unit.mortgages.push(mortgage);
      found = true;
      break;
    }
  }

  if (!found) {
    throw new Error("Unit not found");
  }

  await collateral.save();

  return toPlain(collateral);
}
