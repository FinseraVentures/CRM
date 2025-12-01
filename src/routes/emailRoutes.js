import express from "express";
import { EmailModel } from "../models/EmailModel.js";

const EmailRoutes = express.Router();

// Create a new email entry
EmailRoutes.post("/add", async (req, res) => {
	const { name, companyName, phoneNumber, email, location, service, message } = req.body;

	if (!name || !phoneNumber || !email) {
		return res.status(400).send({ message: "name, phoneNumber and email are required" });
	}

	try {
		const existing = await EmailModel.findOne({ email, phoneNumber });
		if (existing) {
			return res.status(409).send({ message: "Entry with same email and phone already exists" });
		}

		const created = await EmailModel.create({ name, companyName, phoneNumber, email, location, service, message });
		return res.status(201).send({ message: "Email entry created", id: created._id, created });
	} catch (err) {
		console.error(err);
		return res.status(500).send({ message: err.message });
	}
});

// Get all email entries
EmailRoutes.get("/all", async (req, res) => {
	try {
		const all = await EmailModel.find().sort({ createdAt: -1 });
		return res.status(200).send(all);
	} catch (err) {
		console.error(err);
		return res.status(500).send({ message: err.message });
	}
});

// Get single email entry by id
EmailRoutes.get("/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const entry = await EmailModel.findById(id);
		if (!entry) return res.status(404).send({ message: "Not found" });
		return res.status(200).send(entry);
	} catch (err) {
		console.error(err);
		return res.status(500).send({ message: err.message });
	}
});

// Update email entry by id
EmailRoutes.patch("/:id", async (req, res) => {
	const { id } = req.params;
	const updates = req.body;

	try {
		const updated = await EmailModel.findByIdAndUpdate(id, { $set: updates }, { new: true });
		if (!updated) return res.status(404).send({ message: "Not found" });
		return res.status(200).send({ message: "Updated successfully", updated });
	} catch (err) {
		console.error(err);
		return res.status(500).send({ message: err.message });
	}
});

// Delete email entry by id (permanent)
EmailRoutes.delete("/:id", async (req, res) => {
	const { id } = req.params;
	const userRole = req.headers["user-role"]; // require srdev to delete

	if (userRole !== "srdev") {
		return res.status(403).send({ message: "Only srdev can permanently delete entries." });
	}

	try {
		const existing = await EmailModel.findById(id);
		if (!existing) return res.status(404).send({ message: "Not found" });

		await EmailModel.findByIdAndDelete(id);
		return res.status(200).send({ message: "Deleted successfully" });
	} catch (err) {
		console.error(err);
		return res.status(500).send({ message: err.message });
	}
});

export default EmailRoutes;
