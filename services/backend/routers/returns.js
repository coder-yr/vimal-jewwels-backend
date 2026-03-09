import express from "express";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";
import { uploadImage } from "../upload_file.js";

const router = express.Router();

// ─────────────────────────────────────────────
//  CUSTOMER ROUTES
// ─────────────────────────────────────────────

// POST /api/returns — Submit a return request
router.post("/", authenticateToken, uploadImage.array("images", 3), async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId, reason, comments } = req.body;

        if (!orderId || !reason) {
            return res.status(400).json({ status: false, message: "Order ID and Reason are required." });
        }

        // Verify the order belongs to this user
        const order = await db.orders.findOne({ where: { id: orderId, userId } });
        if (!order) {
            return res.status(404).json({ status: false, message: "Order not found or does not belong to you." });
        }

        // Check no duplicate pending return for same order
        const existing = await db.returnRequests.findOne({ where: { orderId, userId } });
        if (existing) {
            return res.status(409).json({ status: false, message: "A return request for this order already exists.", existing });
        }

        const images = req.files ? req.files.map(file => `/images/${file.filename}`) : [];

        const returnRequest = await db.returnRequests.create({
            orderId,
            userId,
            reason,
            comments,
            images,
            status: "Pending",
        });

        res.status(201).json({ status: true, message: "Return request submitted successfully.", returnRequest });
    } catch (error) {
        console.error("Error submitting return request:", error);
        res.status(500).json({ status: false, message: "Internal server error." });
    }
});

// GET /api/returns — Customer's own return requests
router.get("/", authenticateToken, async (req, res) => {
    try {
        const returns = await db.returnRequests.findAll({
            where: { userId: req.user.id },
            order: [["createdAt", "DESC"]],
        });
        res.json({ status: true, returns });
    } catch (error) {
        console.error("Error fetching returns:", error);
        res.status(500).json({ status: false, message: "Internal server error." });
    }
});

// GET /api/returns/:id — Single return request detail (owner or admin)
router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const returnReq = await db.returnRequests.findOne({
            where: { id: req.params.id, userId: req.user.id },
        });
        if (!returnReq) return res.status(404).json({ status: false, message: "Return request not found." });
        res.json({ status: true, returnRequest: returnReq });
    } catch (error) {
        console.error("Error fetching return:", error);
        res.status(500).json({ status: false, message: "Internal server error." });
    }
});

// ─────────────────────────────────────────────
//  ADMIN ROUTES (require admin role)
// ─────────────────────────────────────────────

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ status: false, message: "Admin access required." });
    }
    next();
};

// GET /api/returns/admin/all — List all return requests (admin)
router.get("/admin/all", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const where = {};
        if (status) where.status = status;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await db.returnRequests.findAndCountAll({
            where,
            order: [["createdAt", "DESC"]],
            limit: parseInt(limit),
            offset,
        });

        res.json({ status: true, total: count, page: parseInt(page), returns: rows });
    } catch (error) {
        console.error("Error fetching all returns:", error);
        res.status(500).json({ status: false, message: "Internal server error." });
    }
});

// PATCH /api/returns/:id/status — Admin updates status (approve/reject/mark-received)
router.patch("/:id/status", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status, comments } = req.body;

        const VALID_STATUSES = ["Under Review", "Approved", "Rejected", "Item Received", "Refund Processed"];
        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({ status: false, message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
        }

        const returnReq = await db.returnRequests.findByPk(req.params.id);
        if (!returnReq) return res.status(404).json({ status: false, message: "Return request not found." });

        const updateData = { status };
        if (comments !== undefined) updateData.comments = comments;

        await returnReq.update(updateData);
        res.json({ status: true, message: `Return status updated to "${status}".`, returnRequest: returnReq });
    } catch (error) {
        console.error("Error updating return status:", error);
        res.status(500).json({ status: false, message: "Internal server error." });
    }
});

// POST /api/returns/:id/refund — Admin logs refund settlement
router.post("/:id/refund", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { refundAmount, refundMethod, refundTransactionId, comments } = req.body;

        if (!refundAmount || !refundMethod) {
            return res.status(400).json({ status: false, message: "refundAmount and refundMethod are required." });
        }

        const returnReq = await db.returnRequests.findByPk(req.params.id);
        if (!returnReq) return res.status(404).json({ status: false, message: "Return request not found." });

        if (!["Approved", "Item Received"].includes(returnReq.status)) {
            return res.status(400).json({
                status: false,
                message: `Can only process refund when status is "Approved" or "Item Received". Current: "${returnReq.status}"`
            });
        }

        const mergedComments = [
            returnReq.comments,
            comments,
            `Refund marked by admin: amount=${refundAmount}, method=${refundMethod}${refundTransactionId ? `, txn=${refundTransactionId}` : ""}`,
        ]
            .filter(Boolean)
            .join("\n");

        await returnReq.update({
            status: "Refund Processed",
            comments: mergedComments,
        });

        res.json({ status: true, message: "Refund settlement recorded successfully.", returnRequest: returnReq });
    } catch (error) {
        console.error("Error processing refund:", error);
        res.status(500).json({ status: false, message: "Internal server error." });
    }
});

// PATCH /api/returns/:id/refund/complete — Admin marks refund as fully completed
router.patch("/:id/refund/complete", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const returnReq = await db.returnRequests.findByPk(req.params.id);
        if (!returnReq) return res.status(404).json({ status: false, message: "Return request not found." });

        await returnReq.update({ status: "Refund Processed" });
        res.json({ status: true, message: "Refund marked as completed.", returnRequest: returnReq });
    } catch (error) {
        console.error("Error completing refund:", error);
        res.status(500).json({ status: false, message: "Internal server error." });
    }
});

export default router;
