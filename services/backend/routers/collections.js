import express from "express";
const router = express.Router();
import db from "../db.js";

// GET /api/collections - List all collections
router.get("/", async (req, res) => {
  const collections = await db.collections.findAll();
  res.json(collections);
});

// GET /api/collections/:slug - Get collection details and products
router.get("/:slug", async (req, res) => {
  const collection = await db.collections.findOne({ where: { slug: req.params.slug } });
  if (!collection) return res.status(404).json({ error: "Collection not found" });
  const products = await db.products.findAll({ where: { collectionId: collection.id } });
  res.json({ collection, products });
});

export default router;
