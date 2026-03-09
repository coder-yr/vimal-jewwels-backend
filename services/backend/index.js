import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import winston from "winston";
import db from "./db.js";
import appointmentsRouter from "./routers/appointments.js";
import authRouter from "./routers/auth.js";
import bannersRouter from "./routers/banners.js";
import cartRouter from "./routers/cart.js";
import categoriesRouter from "./routers/categories.js";
import collectionsRouter from "./routers/collections.js";
import footerConfigRouter from "./routers/footer_config.js";
import homeRouter from "./routers/home.js";
import inquiriesRouter from "./routers/inquiries.js";
import megaMenuRouter from "./routers/mega_menu.js";
import ordersRouter from "./routers/orders.js";
import pagesRouter from "./routers/pages.js";
import productsRouter from "./routers/products.js";
import settingsRouter from "./routers/settings.js";
import usersRouter from "./routers/users.js";
import wishlistRouter from "./routers/wishlist.js";
import reviewsRouter from "./routers/reviews.js";
import addressesRouter from "./routers/addresses.js";
import returnsRouter from "./routers/returns.js";
import couponsRouter from "./routers/coupons.js";
import uploadRoutes from "./upload_file.js";

// ... (existing imports)


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Logger Setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

const app = express();

// Security Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(compression());

// Rate Limiting (Disabled for stability)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10000, 
// });
// app.use(limiter);



app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: false, // Must be false when origin is "*"
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: '100kb' })); // Body limit is 100kb
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

const imagesPath = path.join(__dirname, "images");

// Explicitly allow cross-origin for images
app.use("/images", (req, res, next) => {
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static(imagesPath));

// API Routes

// API Routers
app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/collections", collectionsRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", ordersRouter);
app.use("/api", usersRouter);
app.use("/api/banners", bannersRouter);
app.use("/api/home", homeRouter);
app.use("/api", uploadRoutes);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/pages", pagesRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/inquiries", inquiriesRouter);
app.use("/api/footer-configs", footerConfigRouter);
app.use("/api/mega-menu", megaMenuRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/addresses", addressesRouter);
app.use("/api/returns", returnsRouter);
app.use("/api/coupons", couponsRouter);

// Health Check Endpoint
app.get("/health", async (req, res) => {
  try {
    await db.sequelize.authenticate();
    res.status(200).json({ status: 'healthy', database: 'connected', version: process.version });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected', error: error.message });
  }
});

// Root Route
app.get("/", (req, res) => {
  res.send("Welcome to the Vimal Jewellers Backend!");
});

// Fallback Route for undefined routes
app.use((req, res) => {
  res.status(404).send("404: Route not found");
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

const port = process.env.PORT || 7502;

app.listen(port, () => {
  console.log(`🚀 Vimal Jewellers Backend running on port ${port}`);
});

export default app;


