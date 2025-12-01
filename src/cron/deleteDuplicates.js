import cron from "node-cron";
import {EmailModel} from "../models/EmailModel.js";

// Runs every day at midnight (00:00)
cron.schedule("0 */8 * * *", async () => {
  console.log("🧹 Cron Job: Checking for duplicate leads...");

  try {
    // Step 1: Fetch all leads
    const leads = await EmailModel.find({});

    // Step 2: Track unique email/phone combinations
    const seen = new Map();
    const duplicates = [];

    for (const lead of leads) {
      const key = `${lead.email || ""}-${lead.phoneNumber || ""}`.trim();

      if (seen.has(key)) {
        duplicates.push(lead._id); // store duplicate IDs for deletion
      } else {
        seen.set(key, true);
      }
    }

    // Step 3: Delete duplicates permanently
    if (duplicates.length > 0) {
      const result = await EmailModel.deleteMany({ _id: { $in: duplicates } });
      console.log(`🗑️ Deleted ${result.deletedCount} duplicate leads.`);
    } else {
      console.log("✅ No duplicate leads found.");
    }
  } catch (err) {
    console.error("❌ Error deleting duplicate leads:", err);
  }
});
