import express from "express";
import mongoose from "mongoose";
import {InvoiceModel} from "../models/InvoiceModel.js";

const InvoiceRoutes = express.Router();

// Create Invoice
InvoiceRoutes.post("/", async (req, res) => {
	// console.log(req.body);
	try {
		const invoice = new InvoiceModel(req.body);
		await invoice.save();
		res.status(201).json(invoice);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Get all invoices
InvoiceRoutes.get("/", async (req, res) => {
	try {
		const invoices = await InvoiceModel.find();
		res.json(invoices);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get invoice by ID
InvoiceRoutes.get("/:id", async (req, res) => {
	try {
		const invoice = await InvoiceModel.findById(req.params.id);
		if (!invoice) return res.status(404).json({ error: "Invoice not found" });
		res.json(invoice);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update invoice
InvoiceRoutes.put("/:id", async (req, res) => {
	try {
		const invoice = await InvoiceModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!invoice) return res.status(404).json({ error: "Invoice not found" });
		res.json(invoice);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Delete invoice
InvoiceRoutes.delete("/:id", async (req, res) => {
	try {
		const invoice = await InvoiceModel.findByIdAndDelete(req.params.id);
		if (!invoice) return res.status(404).json({ error: "Invoice not found" });
		res.json({ message: "Invoice deleted" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

export default InvoiceRoutes;
