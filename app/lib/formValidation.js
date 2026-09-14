export const FIELD_LIMITS = {
  buildingName: 80,
  buildingId: 40,
  ulpin: 30,
  address: 160,
  city: 60,
  state: 60,
  owner: 100,
  collateralHolder: 100,
  borrower: 100,
  latitude: 10,
  longitude: 11,
  parcelArea: 12,
  floors: 3,
  floorHeight: 6,
  buildingHeight: 7,
  loanAmount: 12,
};

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function cleanText(value, maxLength) {
  return String(value ?? "")
    .replace(CONTROL_CHARS, "")
    .slice(0, maxLength);
}

export function cleanIdentifier(value, maxLength) {
  return cleanText(value, maxLength).replace(/[^a-zA-Z0-9_./-]/g, "");
}

export function cleanWholeNumber(value, maxDigits = 12) {
  return String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, maxDigits);
}

export function cleanUnsignedDecimal(value, maxLength = 12, maxDecimals = 3) {
  let next = String(value ?? "").replace(/[^0-9.]/g, "");
  const dotIndex = next.indexOf(".");

  if (dotIndex >= 0) {
    next = `${next.slice(0, dotIndex)}.${next.slice(dotIndex + 1).replace(/\./g, "")}`;
    const [whole = "", decimal = ""] = next.split(".");
    next = `${whole}.${decimal.slice(0, maxDecimals)}`;
  }

  return next.slice(0, maxLength);
}

export function cleanSignedDecimal(value, maxLength = 11, maxDecimals = 7) {
  let next = String(value ?? "").replace(/[^0-9.-]/g, "");
  next = next.replace(/(?!^)-/g, "");

  const dotIndex = next.indexOf(".");
  if (dotIndex >= 0) {
    next = `${next.slice(0, dotIndex)}.${next.slice(dotIndex + 1).replace(/\./g, "")}`;
  }

  const [sign = "", body = ""] = next.startsWith("-") ? ["-", next.slice(1)] : ["", next];
  const [whole = "", decimal = ""] = body.split(".");
  const output = dotIndex >= 0
    ? `${sign}${whole}.${decimal.slice(0, maxDecimals)}`
    : `${sign}${whole}`;

  return output.slice(0, maxLength);
}

export function parseFiniteNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`${label} must be a valid number.`);
  return number;
}

export function validateCoordinate(value, label, min, max) {
  const number = parseFiniteNumber(value, label);
  if (number < min || number > max) {
    throw new Error(`${label} must be between ${min} and ${max}.`);
  }
  return number;
}

export function validatePositiveNumber(value, label, max) {
  const number = parseFiniteNumber(value, label);
  if (number <= 0 || number > max) {
    throw new Error(`${label} must be greater than 0 and no more than ${max}.`);
  }
  return number;
}

export function validateWholeNumber(value, label, min, max) {
  const number = parseFiniteNumber(value, label);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new Error(`${label} must be a whole number between ${min} and ${max}.`);
  }
  return number;
}
