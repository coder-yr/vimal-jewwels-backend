import express from "express";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const toNum = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const parsed = Number(String(value).replace(/,/g, "").trim());
    return Number.isFinite(parsed) ? parsed : 0;
};

const getAuthenticatedUserId = (req) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return null;
    try {
        const user = jwt.verify(token, JWT_SECRET);
        return user?.id || null;
    } catch {
        return null;
    }
};

// POST /api/coupons/verify - Validate and calculate a coupon discount
router.post("/verify", async (req, res) => {
    try {
        const { code, cartTotal } = req.body;

        if (!code) {
            return res.status(400).json({ status: false, message: "Coupon code is required" });
        }

        let effectiveCartTotal = 0;
        const userId = getAuthenticatedUserId(req);

        if (userId) {
            const cartItems = await db.cartItems.findAll({
                where: { userId },
                include: [
                    {
                        model: db.products,
                        as: "product",
                        attributes: ["price", "mrp"],
                    },
                ],
            });

            effectiveCartTotal = cartItems.reduce((sum, item) => {
                const qty = Math.max(parseInt(item.quantity, 10) || 1, 1);
                const unitPrice = Math.max(toNum(item?.product?.price || item?.product?.mrp), 0);
                return sum + unitPrice * qty;
            }, 0);
        } else {
            effectiveCartTotal = Math.max(toNum(cartTotal), 0);
        }

        if (effectiveCartTotal <= 0) {
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
        if (coupon.minOrderValue > 0 && effectiveCartTotal < coupon.minOrderValue) {
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
            discountAmount = (effectiveCartTotal * coupon.discountValue) / 100;

            // Safety check: Discount cannot make total negative
            if (discountAmount > effectiveCartTotal) {
                discountAmount = effectiveCartTotal;
            }
        }

        if (coupon.discountType === "FLAT" && discountAmount > effectiveCartTotal) {
            discountAmount = effectiveCartTotal;
        }

        // Successful validation!
        res.json({
            status: true,
            message: "Coupon applied successfully",
            coupon: {
                code: coupon.code,
                discountAmount: Math.round(discountAmount), // ensure clean number for frontend
                discountType: coupon.discountType,
                cartTotal: Math.round(effectiveCartTotal)
            }
        });

    } catch (error) {
        console.error("Error verifying coupon:", error);
        res.status(500).json({ status: false, message: "Server error while verifying coupon" });
    }
});

export default router;
