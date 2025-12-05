import express from "express";
import { EmailModel } from "../models/EmailModel.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const LeadRoutes = express.Router();

// Get all leads (exclude trashed by default)
LeadRoutes.get("/all", async (req, res) => {
  try {
    const leads = await EmailModel.find({
      assignedTo: { $in: ["unassigned", "Not Interested"] },
    }).sort({ createdAt: -1 });

    return res.status(200).send(leads);
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: err.message });
  }
});


// Get single lead by id
LeadRoutes.get("/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  try {
    const lead = await EmailModel.findById(id);
    if (!lead || lead.isDeleted)
      return res.status(404).send({ message: "Lead not found" });
    return res.status(200).send(lead);
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: err.message });
  }
});

// Edit lead by id
LeadRoutes.patch("/edit/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const existing = await EmailModel.findById(id);
    console.log(existing);
    if (!existing || existing.isDeleted)
      return res.status(404).send({ message: "Lead not found" });

    const updated = await EmailModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );
    return res.status(200).send({ message: "Lead updated", updated });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: err.message });
  }
});

// Soft-delete (move to trash) lead by id
LeadRoutes.patch("/trash/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const deletedBy = req.headers["user-name"] || "Unknown";

  try {
    const existing = await EmailModel.findById(id);
    if (!existing || existing.isDeleted)
      return res.status(404).send({ message: "Lead not found" });

    existing.isDeleted = true;
    existing.deletedAt = new Date();
    existing.deletedBy = deletedBy;
    await existing.save();

    return res
      .status(200)
      .send({ message: "Lead moved to trash", lead: existing });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: err.message });
  }
});

// Permanent delete - only srdev
LeadRoutes.delete("/delete/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const userRole = req.headers["user-role"];

  if (userRole !== "srdev") {
    return res
      .status(403)
      .send({ message: "Only srdev can permanently delete leads." });
  }

  try {
    const existing = await EmailModel.findById(id);
    if (!existing) return res.status(404).send({ message: "Lead not found" });

    await EmailModel.findByIdAndDelete(id);
    return res.status(200).send({ message: "Lead permanently deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: err.message });
  }
});


export default LeadRoutes;
