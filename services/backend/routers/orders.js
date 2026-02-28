import express from "express";
const router = express.Router();
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

// GET /api/orders - Get all orders for the current user
router.get("/", authenticateToken, async (req, res) => {
  const orders = await db.orders.findAll({ where: { userId: req.user.id } });
  res.json({ orders });
});

// POST /api/orders - Place an order
router.post("/", authenticateToken, async (req, res) => {
  const order = await db.orders.create({ ...req.body, userId: req.user.id });
  res.status(201).json(order);
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
