import express from "express";
const router = express.Router();
import db from "../db.js";

// GET /api/banners - Get homepage banners
router.get("/", async (req, res) => {
  const banners = await db.banners.findAll();
  res.json(banners);
});

export default router;
