// -----------------------------------------------------------------------
// MOCK DATA
// Derived from the supplied architectural blueprint (54m x 20m footprint,
// basement parking + ground + 4 typical residential floors). Nothing here
// comes from a real registry — it exists to make the prototype's ownership
// / mortgage-conflict logic demonstrable end to end.
//
// Dummy site: Connaught Place, New Delhi (28.6315, 77.2167) — chosen only
// because it's a real, recognisable urban block; the building itself is
// fictional.
// -----------------------------------------------------------------------

export const parcel = {
  id: 'DL-CP-0142',
  ulpin: '284710530142', // surface-level ULPIN, 12-digit mock
  name: 'Meridian Residency',
  address: 'Block C, Barakhamba Road, Connaught Place, New Delhi',
  lat: 28.6315,
  lng: 77.2167,
  footprint: { length: 54, width: 20 }, // metres, X (E-W) x Y (N-S)
  registryStatus: 'Verified — DORIS + DLR cross-matched',
}

// --- convert the flat metre footprint into a lat/lng polygon for Leaflet ---
const M_PER_DEG_LAT = 111320
const mPerDegLng = M_PER_DEG_LAT * Math.cos((parcel.lat * Math.PI) / 180)

function metresToLatLng(xOffsetM, yOffsetM) {
  // origin at building's SW corner, offset so the parcel center = parcel.lat/lng
  const dx = xOffsetM - parcel.footprint.length / 2
  const dy = yOffsetM - parcel.footprint.width / 2
  return [parcel.lat + dy / M_PER_DEG_LAT, parcel.lng + dx / mPerDegLng]
}

export const footprintPolygon = [
  metresToLatLng(0, 0),
  metresToLatLng(parcel.footprint.length, 0),
  metresToLatLng(parcel.footprint.length, parcel.footprint.width),
  metresToLatLng(0, parcel.footprint.width),
]

// --- structural reference geometry, used by the 3D view ---------------
export const structure = {
  columnGrid: {
    xs: [0, 6, 12, 18, 24, 30, 36, 42, 48, 54],
    ys: [0, 6.5, 13.5, 20],
  },
  cores: [
    { id: 'core-west', label: 'Stairwell A + Elevators', x: [6, 12], y: [7, 13] },
    { id: 'core-east', label: 'Stairwell B (Fire Exit)', x: [48, 52], y: [8.5, 11.5] },
  ],
  corridor: { x: [0, 54], y: [8.5, 11.5] },
  levels: {
    basement: { z: [-3.5, 0], label: 'Basement — Parking' },
    ground: { z: [0, 3.5], label: 'Ground — Lobby & Amenities' },
    typical: { height: 3.5 }, // each typical floor is 3.5m gross
  },
}

// --- apartment templates (from blueprint §4), reused per floor --------
const APT_TEMPLATE = {
  N: [
    { code: 'N1', type: '2BHK', area: 153, x: [0, 18], y: [11.5, 20] },
    { code: 'N2', type: '2BHK', area: 153, x: [18, 36], y: [11.5, 20] },
    { code: 'N3', type: '2BHK', area: 153, x: [36, 54], y: [11.5, 20] },
  ],
  S: [
    { code: 'S1', type: '3BHK', area: 153, x: [0, 18], y: [0, 8.5] },
    { code: 'S2', type: '3BHK', area: 153, x: [18, 36], y: [0, 8.5] },
    { code: 'S3', type: '3BHK', area: 153, x: [36, 54], y: [0, 8.5] },
  ],
}

const OWNER_NAMES = [
  'Rohit Sharma', 'Anjali Mehta', 'Vikram Nair', 'Sana Qureshi',
  'Arjun Kapoor', 'Priya Iyer', 'Karan Bedi', 'Neha Choudhary',
  'Farhan Ali', 'Divya Rao', 'Suresh Menon', 'Kavita Joshi',
  'Amit Kulkarni', 'Ritu Malhotra', 'Deepak Verma', 'Shreya Pillai',
  'Manoj Tiwari', 'Lakshmi Nair', 'Rahul Saxena', 'Pooja Bhatt',
  'Imran Sheikh', 'Sunita Reddy', 'Gaurav Sethi', 'Meera Krishnan',
]

let ownerCursor = 0
function nextOwner() {
  const name = OWNER_NAMES[ownerCursor % OWNER_NAMES.length]
  ownerCursor += 1
  return name
}

function buildUnits(floorId) {
  const units = [...APT_TEMPLATE.N, ...APT_TEMPLATE.S].map((apt) => ({
    id: `${floorId}-${apt.code}`,
    code: apt.code,
    type: apt.type,
    area: apt.area,
    bounds: { x: apt.x, y: apt.y },
    side: apt.code[0] === 'N' ? 'North' : 'South',
    owner: nextOwner(),
    status: 'owned', // owned | vacant | disputed
    mortgages: [],
  }))
  return units
}

const F1 = buildUnits('F1')
const F2 = buildUnits('F2')
const F3 = buildUnits('F3')
const F4 = buildUnits('F4')

// --- seed a few existing mortgages so the conflict-check has something
//     real to find -------------------------------------------------------
function findUnit(units, code) {
  return units.find((u) => u.code === code)
}

findUnit(F2, 'S2').mortgages.push({
  id: 'MTG-HDFC-88213',
  bank: 'HDFC Bank',
  loanId: 'HDFC-LN-88213',
  amount: 8500000,
  dateIssued: '2023-04-12',
  status: 'active',
})

findUnit(F3, 'N1').mortgages.push({
  id: 'MTG-SBI-55021',
  bank: 'State Bank of India',
  loanId: 'SBI-LN-55021',
  amount: 6200000,
  dateIssued: '2022-11-03',
  status: 'active',
})

// a unit with a flagged title dispute — shows the system catching more
// than just duplicate mortgages
const disputed = findUnit(F4, 'S3')
disputed.status = 'disputed'
disputed.disputeNote = 'Conflicting inheritance claim under review by Sub-Registrar, Delhi.'

// a vacant / unmortgaged unit, for the "clean" success-path demo
findUnit(F1, 'N3').status = 'vacant'
findUnit(F1, 'N3').owner = null

export const floors = [
  {
    id: 'B',
    label: 'Basement',
    sublabel: 'Parking — 30 bays',
    kind: 'parking',
    z: structure.levels.basement.z,
    units: [],
    capacity: 30,
  },
  {
    id: 'G',
    label: 'Ground Floor',
    sublabel: 'Lobby & amenities',
    kind: 'lobby',
    z: structure.levels.ground.z,
    units: [],
  },
  { id: 'F1', label: 'Floor 1', sublabel: '6 units', kind: 'residential', z: [3.5, 7.0], units: F1 },
  { id: 'F2', label: 'Floor 2', sublabel: '6 units', kind: 'residential', z: [7.0, 10.5], units: F2 },
  { id: 'F3', label: 'Floor 3', sublabel: '6 units', kind: 'residential', z: [10.5, 14.0], units: F3 },
  { id: 'F4', label: 'Floor 4', sublabel: '6 units', kind: 'residential', z: [14.0, 17.5], units: F4 },
]

export const BANKS = [
  'HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank',
  'Punjab National Bank', 'Kotak Mahindra Bank',
]
