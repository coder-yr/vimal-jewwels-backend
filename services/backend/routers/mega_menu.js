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
                    as: "categories",
                },
                {
                    model: db.styles,
                    as: "styles",
                },
                {
                    model: db.materials,
                    as: "materials",
                },
                {
                    model: db.shopFor,
                    as: "shopFors",
                },
                {
                    model: db.occasions,
                    as: "occassions",
                },
            ],
        });

        // Transform images to {src, alt} format
        const transformedData = megaCategories.map(cat => {
            const catData = cat.toJSON();

            if (catData.categories) {
                catData.categories = catData.categories.map(c => ({ ...c, image: transformImageUrl(c.image) }));
            }
            if (catData.styles) {
                catData.styles = catData.styles.map(s => ({ ...s, icon: transformImageUrl(s.image) }));
            }
            if (catData.materials) {
                catData.materials = catData.materials.map(m => ({ ...m, icon: transformImageUrl(m.image) }));
            }
            if (catData.occassions) {
                catData.occassions = catData.occassions.map(o => ({ ...o, icon: transformImageUrl(o.image) }));
            }

            return catData;
        });

        res.json(transformedData);
    } catch (error) {
        console.error("Error fetching mega menu:", error);
        res.status(500).json({ error: "Failed to fetch mega menu" });
    }
});

// GET /api/mega-menu/shop-for/:id
router.get("/shop-for/:id", async (req, res) => {
    try {
        const shopFor = await db.shopFor.findByPk(req.params.id, {
            include: [
                {
                    model: db.megaCategories,
                    as: "shopForMegaCategory",
                },
            ],
        });
        if (!shopFor) return res.status(404).json({ error: "Shop For item not found" });
        res.json(shopFor);
    } catch (error) {
        console.error("Error fetching shop for item:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
