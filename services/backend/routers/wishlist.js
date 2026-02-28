import express from "express";
const router = express.Router();
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";
import { transformImageUrl } from "../utils/imageHelper.js";

// Add product to wishlist
router.post("/", authenticateToken, async (req, res) => {
  let { productId } = req.body;

  if (!productId) return res.status(400).json({ error: "Product ID required" });

  // Check if productId is a slug and resolve it to an ID
  if (isNaN(productId)) {
    const product = await db.products.findOne({ where: { slug: productId } });
    if (!product) return res.status(404).json({ error: "Product not found" });
    productId = product.id;
  }

  const existing = await db.wishlist.findOne({ where: { userId: req.user.id, productId } });
  if (existing) return res.status(409).json({ error: "Product already in wishlist" });

  const entry = await db.wishlist.create({ userId: req.user.id, productId });
  res.status(201).json(entry);
});

// Get all wishlist products for user
router.get("/", authenticateToken, async (req, res) => {
  const wishlist = await db.wishlist.findAll({ where: { userId: req.user.id } });
  const productIds = wishlist.map(item => item.productId);
  const products = await db.products.findAll({ where: { id: productIds } });

  // Transform images to {src, alt} format
  const transformedProducts = products.map(product => {
    const productData = product.toJSON();

    // Handle images
    try {
      let parsedImages = [];

      if (productData.images) {
        if (typeof productData.images === 'string') {
          parsedImages = JSON.parse(productData.images);
        } else {
          parsedImages = productData.images;
        }

        // Ensure images is always an array of objects with src and alt
        if (Array.isArray(parsedImages)) {
          productData.images = parsedImages.map(img => {
            if (typeof img === 'string') {
              return { src: transformImageUrl(img), alt: productData.name || "Product Image" };
            }
            return {
              src: transformImageUrl(img.src) || "/placeholder.jpg",
              alt: img.alt || productData.name || "Product Image"
            };
          });
        } else if (parsedImages && typeof parsedImages === 'object') {
          productData.images = [{
            src: transformImageUrl(parsedImages.src) || "/placeholder.jpg",
            alt: parsedImages.alt || productData.name || "Product Image"
          }];
        }
      } else {
        productData.images = [{ src: "/placeholder.jpg", alt: productData.name || "Product Image" }];
      }
    } catch (err) {
      console.error('Error parsing product images:', err);
      productData.images = [{ src: "/placeholder.jpg", alt: productData.name || "Product Image" }];
    }

    return productData;
  });

  res.json({ products: transformedProducts });
});

// Remove product from wishlist
router.delete("/:productId", authenticateToken, async (req, res) => {
  const { productId } = req.params;
  await db.wishlist.destroy({ where: { userId: req.user.id, productId } });
  res.json({ success: true });
});

export default router;
