import mongoose from "mongoose";

const serviceSchema = mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true, unique: true },
    status: { type: Boolean, required: true ,default:true},
  },
  { 
    timestamps: false, 
    versionKey: false
  }
);


export const ServiceModel = mongoose.model("service", serviceSchema);
