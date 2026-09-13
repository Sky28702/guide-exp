"use server";

import connectDB from "../lib/mongodb";
import BuildingRequest from "../models/BuildingRequest";

export async function createBuildingRequest(data) {
  await connectDB();

  const request = await BuildingRequest.create({
    ...data,
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
