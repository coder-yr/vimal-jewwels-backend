import express from "express";
import db from "../../../modules/config/db_helper.js";

const router = express.Router();
const database = db();
const FooterConfig = database.footerConfigs;

router.get("/", async (req, res) => {
    try {
        const configs = await FooterConfig.findAll({
            where: { active: true },
            order: [['priority', 'DESC']]
        });
        res.json(configs);
    } catch (err) {
        console.error("Error fetching footer configs:", err);
        res.status(500).json({ error: "Failed to fetch footer configurations" });
    }
});

export default router;
