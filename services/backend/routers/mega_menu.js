import express from "express";
const router = express.Router();
import db from "../db.js";
import { transformImageUrl } from "../utils/imageHelper.js";

// GET /api/mega-menu - Get mega menu data
router.get("/", async (req, res) => {
    try {
        const megaCategories = await db.megaCategories.findAll({
            include: [
                {
                    model: db.categories,
                    as: "megaCategoryCategories",
                },
            ],
        });

        // Transform images to {src, alt} format
        const transformedData = megaCategories.map(cat => {
            const catData = cat.toJSON();

            // Re-map back to backwards-compatible API json keys
            catData.categories = catData.megaCategoryCategories;
            delete catData.megaCategoryCategories;

            if (catData.categories) {
                catData.categories = catData.categories.map(c => ({ ...c, image: transformImageUrl(c.image) }));
            }

            return catData;
        });

        res.json(transformedData);
    } catch (error) {
        console.error("Error fetching mega menu:", error);
        res.status(500).json({ error: "Failed to fetch mega menu" });
    }
});

export default router;
