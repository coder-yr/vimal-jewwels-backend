
import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get Settings
router.get('/', async (req, res) => {
    try {
        if (!db.settings) {
            console.error("db.settings is undefined!");
            return res.status(500).json({ error: "db.settings is undefined" });
        }
        const settings = await db.settings.findOne();
        // console.log("Settings found:", settings); // Excessive logging
        res.json(settings || {});
    } catch (error) {
        console.error("Error fetching settings:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
