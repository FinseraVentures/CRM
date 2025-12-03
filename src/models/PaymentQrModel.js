import mongoose from "mongoose";

const PaymentQRSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    bdm: {
      type: String,
    },

    amount: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
    },

    qr_id: {
      type: String,
      required: true,
      unique: true,
    },

    qr_image: {
      type: String,
    },

    usage: {
      type: String,
      default: "single_use",
    },

    purpose: {
      type: String,
      default: "UPI QR Payment",
    },

    fixed_amount: {
      type: Boolean,
      default: true,
    },

    close_by: {
      type: Number, // Unix timestamp
    },

    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Paid", "Expired", "Cancelled"],
    },

    createdOn: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const PaymentQRModel = mongoose.model("PaymentQR", PaymentQRSchema);
