import express from "express";
import Razorpay from "razorpay";
import dotenv from "dotenv";
// import authenticateUser from "../middleware/authenticateUser.js";
import { appendToGoogleSheet } from "../utils/googleSheetLog.js";

dotenv.config();

const PaymentRoutes = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

PaymentRoutes.post("/create-upi-link", async (req, res) => {
  try {
    const { amount, name, email, phone, description, notifyEmail = true, notifySms = true,bdm } = req.body;

    if (!amount || !email || !phone) {
      return res.status(400).send({
        message: "Amount, email, and phone are required fields.",
      });
    }

    // Create the payment link
    const paymentLink = await razorpay.paymentLink.create({
      amount: Math.round(amount * 100), // Razorpay accepts paise (₹1 = 100 paise)
      currency: "INR",
      accept_partial: false,
      description: description || "UPI Payment",
      customer: {
        name: name || "Customer",
        email,
        contact: phone,
      },
      notify: {
        sms: notifySms,
        email: notifyEmail,
      },
      reminder_enable: true,
      notes: {
        purpose: "UPI Payment Link",
      },
      callback_url: "https://your-frontend-url.com/payment-status",
      callback_method: "get",
    });
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
      // Decide: continue and return success or fail the request.
      // We'll continue and return success (so link creation isn't blocked).
    }

    return res.status(200).json({
      message: "Payment link created successfully",
      payment_link_id: paymentLink.id,
      short_url: paymentLink.short_url,
    });
  } catch (err) {
    console.error("❌ Razorpay Error:", err);
    return res.status(500).send({
      message: err.error?.description || err.message || "Payment link creation failed.",
    });
  }
});

//creating qr
PaymentRoutes.post("/create-qr", async (req, res) => {
  // console.log(req.body)
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
      close_by_hours, // 🆕 optional
    } = req.body;

    if (!amount || !name) {
      return res.status(400).json({
        message: "Amount and name are required",
      });
    }

    // 🕒 Compute close_by timestamp
    const closeBy = Math.floor(Date.now() / 1000) + (close_by_hours ? close_by_hours * 3600 : 24 * 3600);

    const qrData = {
      type: "upi_qr",
      name,
      usage: usage || "single_use",
      fixed_amount: fixed_amount !== undefined ? fixed_amount : true,
      payment_amount: Math.round(amount * 100),
      description: description || "UPI QR Payment",
      close_by: closeBy,
      notes: {
        purpose: purpose || "UPI QR Payment",
      },
    };

    if (customer_id) qrData.customer_id = customer_id;

    const qr = await razorpay.qrCode.create(qrData);
    const imageRes = await fetch(qr.image_url);
    const buffer = await imageRes.arrayBuffer();
    const base64QR = Buffer.from(buffer).toString("base64");
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
      // Decide: continue and return success or fail the request.
      // We'll continue and return success (so link creation isn't blocked).
    }

    res.status(200).json({
      message: "QR Code created successfully",
      qr_id: qr.id,
      qr_data: qr,
      qr_base64: `data:image/png;base64,${base64QR}`
    });
  } catch (err) {
    console.error("QR create error:", err);
    res.status(500).json({ message: err.message });
  }
});




export default PaymentRoutes;
