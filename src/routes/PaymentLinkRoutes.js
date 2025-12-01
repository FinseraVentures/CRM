import expresss from 'express';
import { authenticateUser } from '../middleware/authenticateUser.js';
import { PaymentLinkModel } from '../models/PaymentLinkModel.js';   

const paymentLinkRoutes = expresss.Router();

// Route to create a new payment link
paymentLinkRoutes.post(
  "/api/payment-links",
  authenticateUser,
  async (req, res) => {
    const {
      customer,
      contact,
      amount,
      bdm,
      description,
      link,
      status,
      createdOn,
    } = req.body;

    try {
      const paymentLink = await PaymentLinkModel.create(req.body);
      res.status(201).json({
        success: true,
        message: "Payment link created",
        data: paymentLink,
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);


//get all payment links
paymentLinkRoutes.get(
  "/api/payment-links",
  authenticateUser,
  async (req, res) => {
    try {
      const paymentLinks = await PaymentLinkModel.find().sort({
        createdOn: -1,
      });
      res.json({
        success: true,
        count: paymentLinks.length,
        data: paymentLinks,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

//uodate payment link status
paymentLinkRoutes.put(
  "/api/payment-links/:id/status",
  authenticateUser,
  async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
      const paymentLink = await PaymentLinkModel.findByIdAndUpdate(id, status, {
        new: true,
      });

      if (!paymentLink) {
        return res.status(404).json({ success: false, message: "Not found" });
      }

      res.json({
        success: true,
        message: "Payment link updated",
        data: paymentLink,
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

  //get payment link by id
  paymentLinkRoutes.get('/api/payment-links/:id', authenticateUser, async (req, res) => {
    const { id } = req.params;
     try {
       const paymentLink = await PaymentLink.findById(id);

       if (!paymentLink) {
         return res.status(404).json({ success: false, message: "Not found" });
       }

       res.json({ success: true, data: paymentLink });
     } catch (error) {
       res.status(400).json({ success: false, error: error.message });
     }
  }
);


export default paymentLinkRoutes;