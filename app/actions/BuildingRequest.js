"use server";

import connectDB from "../lib/mongodb";
import BuildingRequest from "../models/BuildingRequest";
import {
  FIELD_LIMITS,
  cleanIdentifier,
  cleanText,
  validateCoordinate,
  validatePositiveNumber,
  validateWholeNumber,
} from "../lib/formValidation";

export async function createBuildingRequest(data) {
  await connectDB();

  const userId = cleanText(data?.userId, 120).trim();
  const buildingName = cleanText(data?.buildingName, FIELD_LIMITS.buildingName).trim();
  const buildingId = cleanIdentifier(data?.buildingId, FIELD_LIMITS.buildingId).trim();
  const ulpin = cleanIdentifier(data?.ulpin, FIELD_LIMITS.ulpin).trim();
  const address = cleanText(data?.address, FIELD_LIMITS.address).trim();
  const city = cleanText(data?.city, FIELD_LIMITS.city).trim();
  const state = cleanText(data?.state, FIELD_LIMITS.state).trim();
  const owner = cleanText(data?.owner, FIELD_LIMITS.owner).trim();

  if (!userId || !buildingName || !buildingId || !address || !city || !state) {
    throw new Error("Required building request fields are missing.");
  }

  const latitude = validateCoordinate(data?.latitude, "Latitude", -90, 90);
  const longitude = validateCoordinate(data?.longitude, "Longitude", -180, 180);
  const parcelArea = data?.parcelArea == null || data?.parcelArea === ""
    ? null
    : validatePositiveNumber(data.parcelArea, "Parcel area", 100000000);
  const floors = data?.floors == null || data?.floors === ""
    ? 1
    : validateWholeNumber(data.floors, "Floors", 1, 200);
  const floorHeight = data?.floorHeight == null || data?.floorHeight === ""
    ? null
    : validatePositiveNumber(data.floorHeight, "Floor height", 20);
  const buildingHeight = data?.buildingHeight == null || data?.buildingHeight === ""
    ? null
    : validatePositiveNumber(data.buildingHeight, "Building height", 500);

  const request = await BuildingRequest.create({
    userId,
    buildingName,
    buildingId,
    ulpin,
    address,
    city,
    state,
    owner,
    latitude,
    longitude,
    parcelArea,
    floors,
    floorHeight,
    buildingHeight,
    status: "PENDING",
    surfaceParcelStatus: "PENDING",
  });

  return JSON.parse(JSON.stringify(request));
}

export async function getMyBuildingRequests(userId) {
  await connectDB();

  const requests = await BuildingRequest.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(requests));
}
