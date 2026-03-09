import express from "express";
import { Op } from "sequelize";
import db from "../db.js";

const router = express.Router();

// POST /api/coupons/verify - Validate and calculate a coupon discount
router.post("/verify", async (req, res) => {
    try {
        const { code, cartTotal } = req.body;

        if (!code) {
            return res.status(400).json({ status: false, message: "Coupon code is required" });
        }

        if (cartTotal === undefined || cartTotal === null) {
            return res.status(400).json({ status: false, message: "Cart total is required to verify coupon" });
        }

        // Find the coupon in the database (case-insensitive)
        const coupon = await db.coupons.findOne({
            where: {
                code: code.trim().toUpperCase()
            }
        });

        if (!coupon) {
            return res.status(404).json({ status: false, message: "Invalid coupon code" });
        }

        if (!coupon.isActive) {
            return res.status(400).json({ status: false, message: "This coupon is no longer active" });
        }

        // Check expiry date if one exists
        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
            return res.status(400).json({ status: false, message: "This coupon has expired" });
        }

        // Check minimum order value
        if (coupon.minOrderValue > 0 && cartTotal < coupon.minOrderValue) {
            return res.status(400).json({
                status: false,
                message: `Cart total must be at least ₹${coupon.minOrderValue.toLocaleString('en-IN')} to use this coupon`
            });
        }

        // Calculate the actual discount value
        let discountAmount = 0;
        if (coupon.discountType === "FLAT") {
            discountAmount = coupon.discountValue;
        } else if (coupon.discountType === "PERCENTAGE") {
            // Calculate percentage, capping it at the total cart value if it somehow exceeds 100%
            discountAmount = (cartTotal * coupon.discountValue) / 100;

            // Safety check: Discount cannot make total negative
            if (discountAmount > cartTotal) {
                discountAmount = cartTotal;
            }
        }

        // Successful validation!
        res.json({
            status: true,
            message: "Coupon applied successfully",
            coupon: {
                code: coupon.code,
                discountAmount: Math.round(discountAmount), // ensure clean number for frontend
                discountType: coupon.discountType
            }
        });

    } catch (error) {
        console.error("Error verifying coupon:", error);
        res.status(500).json({ status: false, message: "Server error while verifying coupon" });
    }
});

export default router;
