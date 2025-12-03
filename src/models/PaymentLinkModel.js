import mongoose from "mongoose";

const paymentLinkSchema = new mongoose.Schema(
  {
    customer: {
      type: String,
      required: true,
      trim: true,
    },

    contact: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    bdm: {
      type: String,
      required: true,
      default: "",  
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    link: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "PAID", "EXPIRED", "FAILED"],
      default: "PENDING",
    },

    createdOn: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

export const PaymentLinkModel = mongoose.model("PaymentLink", paymentLinkSchema);
