import express from "express";
const router = express.Router();
import db from "../db.js";

// GET /api/pages/:slug - Get page by slug
router.get("/:slug", async (req, res) => {
    try {
        const { slug } = req.params;
        const page = await db.pages.findOne({ where: { slug } });
        if (!page) {
            return res.status(404).json({ message: "Page not found" });
        }
        res.json(page);
    } catch (error) {
        console.error("Error fetching page:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
