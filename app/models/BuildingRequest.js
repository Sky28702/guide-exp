import mongoose from "mongoose";

const BuildingRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    buildingName: {
      type: String,
      required: true,
      trim: true,
    },

    buildingId: {
      type: String,
      required: true,
      trim: true,
    },

    ulpin: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    parcelArea: {
      type: Number,
      default: null,
    },

    floors: {
      type: Number,
      default: 1,
    },

    floorHeight: {
      type: Number,
      default: null,
    },

    buildingHeight: {
      type: Number,
      default: null,
    },

    owner: {
      type: String,
      default: "",
    },

    // GIS / drone / LiDAR work
    parcelGeometry: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "DONE"],
      default: "PENDING",
    },

    surfaceParcelStatus: {
      type: String,
      enum: ["PENDING", "DONE"],
      default: "PENDING",
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.BuildingRequest ||
  mongoose.model("BuildingRequest", BuildingRequestSchema);
