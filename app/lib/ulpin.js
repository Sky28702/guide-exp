export function buildingUlpin(parcel) {
  return parcel.id;
}

export function floorUlpin(parcel, floor) {
  return `${parcel.id}-${floor.id}`;
}

export function unitUlpin(parcel, floor, unit) {
  return `${parcel.id}-${floor.id}-${unit.code}`;
}

export function formatINR(amount) {
  return "₹" + Number(amount || 0).toLocaleString("en-IN");
}
