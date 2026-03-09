import express from "express";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/cart - Return current user's cart items
router.get("/", authenticateToken, async (req, res) => {
  console.log(`[CART] Fetching cart for user: ${req.user.id}`);
  try {
    const userId = req.user.id;
    const cartItems = await db.cartItems.findAll({
      where: { userId },
      include: [
        {
          model: db.products,
          as: "product",
          attributes: ["id", "name", "slug", "images", "price"],
        },
      ],
    });
    res.json({ status: true, cart: cartItems });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ status: false, message: "Server Error" });
  }
});

// POST /api/cart - Add item or increment quantity
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, variantMetalId, variantDiamondId, ringSize, quantity, customEngraving } = req.body;

    if (!productId) {
      return res.status(400).json({ status: false, message: "Product ID is required" });
    }

    // Check if identical item exists
    const existingItem = await db.cartItems.findOne({
      where: {
        userId,
        productId,
        variantMetalId: variantMetalId || null,
        variantDiamondId: variantDiamondId || null,
        ringSize: ringSize || null,
        customEngraving: customEngraving || null,
      },
    });

    if (existingItem) {
      existingItem.quantity += parseInt(quantity) || 1;
      await existingItem.save();
      return res.json({ status: true, message: "Cart updated", item: existingItem });
    } else {
      const newItem = await db.cartItems.create({
        userId,
        productId,
        variantMetalId: variantMetalId || null,
        variantDiamondId: variantDiamondId || null,
        ringSize: ringSize || null,
        quantity: parseInt(quantity) || 1,
        customEngraving: customEngraving || null,
      });
      return res.status(201).json({ status: true, message: "Item added to cart", item: newItem });
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ status: false, message: "Server Error" });
  }
});

// POST /api/cart/merge - Merge local storage cart on login
router.post("/merge", authenticateToken, async (req, res) => {
  console.log(`[CART] Merging cart for user: ${req.user.id}`, req.body.localItems);
  try {
    const userId = req.user.id;
    const { localItems } = req.body; // Array of cart item objects

    if (!localItems || !Array.isArray(localItems)) {
      return res.status(400).json({ status: false, message: "Invalid payload" });
    }

    for (const item of localItems) {
      const {
        productId,
        variantMetalId = null,
        variantDiamondId = null,
        ringSize = null,
        quantity = 1,
        customEngraving = null,
      } = item;

      // Ensure that productID exists
      if (!productId) continue;

      const existingItem = await db.cartItems.findOne({
        where: {
          userId,
          productId,
          variantMetalId,
          variantDiamondId,
          ringSize,
          customEngraving,
        },
      });

      if (existingItem) {
        existingItem.quantity += parseInt(quantity);
        await existingItem.save();
      } else {
        await db.cartItems.create({
          userId,
          productId,
          variantMetalId,
          variantDiamondId,
          ringSize,
          quantity: parseInt(quantity),
          customEngraving,
        });
      }
    }

    res.json({ status: true, message: "Cart merged successfully" });
  } catch (error) {
    console.error("Error merging cart:", error);
    res.status(500).json({ status: false, message: "Server Error" });
  }
});

// PUT /api/cart/product/:productId - Update cart item quantity
router.put("/product/:productId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;
    const { quantity, ringSize } = req.body;

    const item = await db.cartItems.findOne({ where: { productId, userId } });
    if (!item) {
      return res.status(404).json({ status: false, message: "Cart item not found" });
    }

    if (quantity !== undefined) item.quantity = parseInt(quantity);
    if (ringSize !== undefined) item.ringSize = ringSize;

    await item.save();
    res.json({ status: true, message: "Cart item updated", item });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ status: false, message: "Server Error" });
  }
});

// PUT /api/cart/:id - Update cart item by primary key
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity, ringSize } = req.body;

    const item = await db.cartItems.findOne({ where: { id, userId } });
    if (!item) {
      return res.status(404).json({ status: false, message: "Cart item not found" });
    }

    if (quantity !== undefined) item.quantity = parseInt(quantity);
    if (ringSize !== undefined) item.ringSize = ringSize;

    await item.save();
    res.json({ status: true, message: "Cart item updated", item });
  } catch (error) {
    console.error("Error updating cart item by ID:", error);
    res.status(500).json({ status: false, message: "Server Error" });
  }
});

// DELETE /api/cart/:id - Remove specific cart item by primary key
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deletedCount = await db.cartItems.destroy({ where: { id, userId } });
    if (deletedCount === 0) {
      return res.status(404).json({ status: false, message: "Cart item not found" });
    }

    res.json({ status: true, message: "Item removed from cart" });
  } catch (error) {
    console.error("Error deleting cart item by ID:", error);
    res.status(500).json({ status: false, message: "Server Error" });
  }
});

export default router;
