import express from "express";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import { appendToGoogleSheet } from "../utils/googleSheetLog.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import { PaymentLinkModel } from "../models/PaymentLinkModel.js"; 
import { PaymentQRModel } from "../models/PaymentQrModel.js";

dotenv.config();

const PaymentRoutes = express.Router();

// INIT RAZORPAY

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// 🟢 CREATE PAYMENT LINK + SAVE TO MONGO + SAVE LOG TO SHEET

PaymentRoutes.post("/create-upi-link", authenticateUser, async (req, res) => {
  try {
    const {
      amount,
      name,
      email,
      phone,
      description,
      notifyEmail = true,
      notifySms = true,
      bdm,
    } = req.body;

    if (!amount || !email || !phone) {
      return res
        .status(400)
        .json({ message: "Amount, email & phone are required." });
    }

    // Create Razorpay Payment Link
    const paymentLink = await razorpay.paymentLink.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      accept_partial: false,
      description: description || "UPI Payment",
      customer: {
        name: name || "Customer",
        email,
        contact: phone,
      },
      notify: { sms: notifySms, email: notifyEmail },
      reminder_enable: true,
      notes: { purpose: "UPI Payment Link" },
      callback_url: "https://your-frontend-url.com/payment-status",
      callback_method: "get",
    });

    // Save to Google Sheet
    try {
      await appendToGoogleSheet({
        type: "LINK",
        description,
        email,
        phone,
        bdm,
        paymentLink: paymentLink.short_url,
        amount,
        status: "Pending",
        name,
      });
    } catch (sheetErr) {
      console.error("Sheet logging failed:", sheetErr);
    }

    // Save in DB
    await PaymentLinkModel.create({
      customer: name,
      contact: phone,
      amount,
      bdm,
      description,
      link: paymentLink.short_url,
      status: "Pending",
      createdOn: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Payment link created",
      payment_link_id: paymentLink.id,
      short_url: paymentLink.short_url,
    });
  } catch (err) {
    console.error("❌ Razorpay Error:", err);
    res.status(500).json({
      message:
        err.error?.description ||
        err.message ||
        "Payment link creation failed.",
    });
  }
});

// 🟣 CREATE QR CODE + SAVE LOG

PaymentRoutes.post("/create-qr", authenticateUser, async (req, res) => {
  try {
    const {
      amount,
      bdm,
      name,
      description,
      customer_id,
      purpose,
      usage,
      fixed_amount,
      close_by_hours,
    } = req.body;

    if (!amount || !name) {
      return res
        .status(400)
        .json({ success: false, message: "Amount and name are required" });
    }

    const closeBy =
      Math.floor(Date.now() / 1000) +
      (close_by_hours ? close_by_hours * 3600 : 24 * 3600);

    const qrData = {
      type: "upi_qr",
      name,
      usage: usage || "single_use",
      fixed_amount: fixed_amount ?? true,
      payment_amount: Math.round(amount * 100),
      description: description || "UPI QR Payment",
      close_by: closeBy,
      notes: { purpose: purpose || "UPI QR Payment" },
    };

    if (customer_id) qrData.customer_id = customer_id;

    // create QR with Razorpay
    const qr = await razorpay.qrCode.create(qrData);

    // fetch image and convert to base64 (if environment supports fetch)
    let base64QR = null;
    try {
      const imageRes = await fetch(qr.image_url);
      const buffer = await imageRes.arrayBuffer();
      base64QR = Buffer.from(buffer).toString("base64");
    } catch (imgErr) {
      console.error("Failed to fetch/convert QR image:", imgErr);
      // continue — base64 may not be critical
    }

    // Google Sheet logging (best-effort)
    (async () => {
      try {
        await appendToGoogleSheet({
          type: "QR",
          name,
          bdm,
          amount,
          description,
          qr_id: qr.id,
          qr_image: qr.image_url,
          usage,
          purpose,
          fixed_amount,
          close_by: closeBy,
          status: "Pending",
        });
      } catch (sheetErr) {
        console.error("Sheet logging failed:", sheetErr);
      }
    })();

    // Save to MongoDB
    let savedQR = null;
    try {
      savedQR = await PaymentQRModel.create({
        name,
        bdm,
        amount,
        description,
        qr_id: qr.id,
        qr_image: qr.image_url,
        usage: usage || "single_use",
        purpose: purpose || "UPI QR Payment",
        fixed_amount: fixed_amount ?? true,
        close_by: closeBy,
        status: "Pending",
        createdOn: new Date(),
      });
    } catch (dbErr) {
      console.error("Failed to save QR to DB:", dbErr);
      // proceed — return Razorpay response even if DB save failed
    }

    return res.status(201).json({
      success: true,
      message: "QR Code created",
      qr_id: qr.id,
      qr_data: qr,
      qr_base64: base64QR ? `data:image/png;base64,${base64QR}` : null,
      savedRecord: savedQR, // may be null if DB save failed
    });
  } catch (err) {
    console.error("QR create error:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "QR creation failed" });
  }
});


// 🟡 SAVE PAYMENT LINK MANUALLY (OLD ROUTE)
// PaymentRoutes.post("/api/payment-links", authenticateUser, async (req, res) => {
//   try {
//     const paymentLink = await PaymentLinkModel.create(req.body);

//     res.status(201).json({
//       success: true,
//       message: "Payment link created",
//       data: paymentLink,
//     });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// });


// 🟠 GET ALL PAYMENT LINKS
PaymentRoutes.get("/api/payment-links", authenticateUser, async (req, res) => {
  try {
    const paymentLinks = await PaymentLinkModel.find().sort({ createdOn: -1 });

    res.json({
      success: true,
      count: paymentLinks.length,
      data: paymentLinks,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// 🔵 UPDATE PAYMENT LINK STATUS (PATCH)
PaymentRoutes.patch(
  "/api/payment-links/:id/status",
  authenticateUser,
  async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // 1️⃣ Validate input
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required.",
      });
    }

    try {
      // 2️⃣ Patch only the provided field
      const updated = await PaymentLinkModel.findByIdAndUpdate(
        id,
        { $set: { status } },
        { new: true, runValidators: true }
      );

      // 3️⃣ If ID is invalid or no document found
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Payment link not found.",
        });
      }

      // 4️⃣ Success response
      return res.status(200).json({
        success: true,
        message: "Payment link status updated successfully.",
        data: updated,
      });
    } catch (error) {
      console.error("Status update error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update payment link status.",
        error: error.message,
      });
    }
  }
);


// 🔴 GET PAYMENT LINK BY ID
PaymentRoutes.get(
  "/api/payment-links/:id",
  authenticateUser,
  async (req, res) => {
    const { id } = req.params;

    try {
      const paymentLink = await PaymentLinkModel.findById(id);

      if (!paymentLink) {
        return res.status(404).json({ success: false, message: "Not found" });
      }

      res.json({ success: true, data: paymentLink });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

export default PaymentRoutes;
