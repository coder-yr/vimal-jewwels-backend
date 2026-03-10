import express from "express";
const router = express.Router();
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const toNum = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
};

// GET /api/orders - Get all orders for the current user
router.get("/", authenticateToken, async (req, res) => {
  const orders = await db.orders.findAll({ where: { userId: req.user.id } });
  res.json({ orders });
});

// POST /api/orders - Place an order
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const paymentMethod = typeof req.body?.paymentMethod === "string" ? req.body.paymentMethod.trim() : null;
    const address = req.body?.address ?? null;

    if (!address) {
      return res.status(400).json({ status: false, message: "Shipping address is required" });
    }

    const cartItems = await db.cartItems.findAll({
      where: { userId },
      include: [
        {
          model: db.products,
          as: "product",
          attributes: ["id", "name", "images", "shortcode", "price", "mrp"],
        },
      ],
    });

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ status: false, message: "Cart is empty" });
    }

    let computedTotal = 0;
    const itemsSnapshot = [];

    for (const cartItem of cartItems) {
      if (!cartItem.product) continue;

      const qty = Math.max(parseInt(cartItem.quantity, 10) || 1, 1);
      const unitPrice = Math.max(toNum(cartItem.product.price || cartItem.product.mrp), 0);
      const lineTotal = unitPrice * qty;
      computedTotal += lineTotal;

      itemsSnapshot.push({
        productId: cartItem.product.id,
        name: cartItem.product.name,
        sku: cartItem.product.shortcode || null,
        image: Array.isArray(cartItem.product.images) ? cartItem.product.images[0] : cartItem.product.images,
        unitPrice,
        quantity: qty,
        lineTotal,
        ringSize: cartItem.ringSize || null,
        variantMetalId: cartItem.variantMetalId || null,
        variantDiamondId: cartItem.variantDiamondId || null,
      });
    }

    if (itemsSnapshot.length === 0) {
      return res.status(400).json({ status: false, message: "No valid products in cart" });
    }

    const order = await db.sequelize.transaction(async (transaction) => {
      const createdOrder = await db.orders.create(
        {
          userId,
          items: itemsSnapshot,
          total: Math.round(computedTotal),
          status: "Processing",
          address,
          paymentMethod: paymentMethod || "Unknown",
        },
        { transaction },
      );

      await db.cartItems.destroy({ where: { userId }, transaction });
      return createdOrder;
    });

    res.status(201).json({
      id: order.id,
      status: order.status,
      total: order.total,
      paymentMethod: order.paymentMethod,
      items: order.items,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ status: false, message: "Order creation failed" });
  }
});

// GET /api/orders/:id - Get order details
router.get("/:id", authenticateToken, async (req, res) => {
  const order = await db.orders.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!order) return res.status(404).json({ error: "Order not found" });

  // Get product details for all items (assuming items is an array of product IDs)
  let products = [];
  if (order.items && Array.isArray(order.items) && order.items.length > 0) {
    const productIds = order.items.map(item => item.productId || item.id || item);
    const productsData = await db.products.findAll({
      where: { id: productIds },
      attributes: ['id', 'name', 'images', 'shortcode', 'price', 'mrp']
    });

    const productMap = new Map(productsData.map(p => [String(p.id), p]));

    for (const item of order.items) {
      const productId = item.productId || item.id || item;
      const product = productMap.get(String(productId));
      products.push({
        name: product ? product.name : "Product Not Found",
        image: product ? (Array.isArray(product.images) ? product.images[0] : product.images) : "/placeholder.svg",
        sku: product ? product.shortcode || "N/A" : "N/A",
        price: product ? product.price || product.mrp || 0 : order.total || 0,
        qty: item.qty || 1,
      });
    }
  }

  // Sample timeline/history (replace with real data if available)
  const history = [
    { date: "2025-09-09", time: "10:00", description: "Order placed" },
    { date: "2025-09-10", time: "12:00", description: "Order shipped" },
    { date: "2025-09-11", time: "15:00", description: "Out for delivery" },
    { date: "2025-09-12", time: "18:00", description: "Delivered" },
  ];

  res.json({
    id: order.id,
    status: order.status,
    products,
    history,
    total: order.total,
    address: order.address,
  });
});

export default router;
