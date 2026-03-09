import express from "express";
import db from "../db.js";
import { authenticateToken as authMiddleware } from "../middleware/auth.js";

const addressesRouter = express.Router();

// Get all addresses for logged-in user
addressesRouter.get("/", authMiddleware, async (req, res) => {
    try {
        const addresses = await db.addresses.findAll({
            where: { userId: req.user.id },
            order: [
                ['isDefault', 'DESC'],
                ['createdAt', 'DESC']
            ]
        });
        res.status(200).json({ addresses });
    } catch (error) {
        console.error("Error fetching addresses:", error);
        res.status(500).json({ error: "Failed to fetch addresses" });
    }
});

// Add a new address
addressesRouter.post("/", authMiddleware, async (req, res) => {
    try {
        const { line1, line2, landmark, city, state, country, pincode, isDefault, addressType } = req.body;

        // If this is set to default, or it's the first address, unset default for others
        const existingCount = await db.addresses.count({ where: { userId: req.user.id } });
        let newIsDefault = isDefault || existingCount === 0;

        if (newIsDefault) {
            await db.addresses.update({ isDefault: false }, { where: { userId: req.user.id } });
        }

        const newAddress = await db.addresses.create({
            userId: req.user.id,
            line1,
            line2,
            landmark,
            city,
            state,
            country: country || "India",
            pincode,
            isDefault: newIsDefault,
            addressType: addressType || "Home"
        });

        res.status(201).json({ message: "Address added successfully", address: newAddress });
    } catch (error) {
        console.error("Error adding address:", error);
        res.status(500).json({ error: "Failed to add address" });
    }
});

// Edit an existing address
addressesRouter.put("/:id", authMiddleware, async (req, res) => {
    try {
        const addressId = req.params.id;
        const address = await db.addresses.findOne({ where: { id: addressId, userId: req.user.id } });

        if (!address) {
            return res.status(404).json({ error: "Address not found" });
        }

        const { line1, line2, landmark, city, state, country, pincode, isDefault, addressType } = req.body;

        if (isDefault && !address.isDefault) {
            await db.addresses.update({ isDefault: false }, { where: { userId: req.user.id } });
        }

        await address.update({
            line1, line2, landmark, city, state, country, pincode,
            isDefault: isDefault !== undefined ? isDefault : address.isDefault,
            addressType: addressType || address.addressType
        });

        res.status(200).json({ message: "Address updated successfully", address });
    } catch (error) {
        console.error("Error updating address:", error);
        res.status(500).json({ error: "Failed to update address" });
    }
});

// Delete an address
addressesRouter.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const addressId = req.params.id;
        const deletedRows = await db.addresses.destroy({
            where: { id: addressId, userId: req.user.id }
        });

        if (deletedRows === 0) {
            return res.status(404).json({ error: "Address not found or unauthorized" });
        }

        res.status(200).json({ message: "Address deleted successfully" });
    } catch (error) {
        console.error("Error deleting address:", error);
        res.status(500).json({ error: "Failed to delete address" });
    }
});

export default addressesRouter;
