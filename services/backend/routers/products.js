import express from "express";
const router = express.Router();
import db from "../db.js";
import { Op } from "sequelize";

// GET /api/products - List all products (supports ?search=, ?sort=, ?categoryId=, ?limit=)

router.get("/", async (req, res) => {
  try {
    const { search, sort, categoryId, limit } = req.query;

    // Build WHERE clause
    const where = {};
    if (search && search.trim()) {
      where.name = { [Op.like]: `%${search.trim()}%` };
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Build ORDER clause
    let order = [["id", "DESC"]]; // default: newest first
    if (sort === "price_asc") order = [["price", "ASC"]];
    else if (sort === "price_desc") order = [["price", "DESC"]];
    else if (sort === "newest") order = [["createdAt", "DESC"]];
    else if (sort === "name_asc") order = [["name", "ASC"]];

    const queryOptions = {
      where,
      order,
      include: [
        { model: db.metalRates, as: "metalRate" }
      ]
    };
    if (limit) queryOptions.limit = parseInt(limit, 10);

    const products = await db.products.findAll(queryOptions);

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
                return { src: img, alt: productData.name || "Product Image" };
              }
              return {
                src: img.src || "/placeholder.jpg",
                alt: img.alt || productData.name || "Product Image"
              };
            });
          }
        }
      } catch (err) {
        console.error('Error parsing product images:', err);
        productData.images = [{ src: "/placeholder.jpg", alt: productData.name || "Product Image" }];
      }

      return productData;
    });

    res.json(transformedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// GET /api/products/slug/:slug - Get product details by slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const product = await db.products.findOne({
      where: { slug: req.params.slug },
      include: [
        {
          model: db.metalRates,
          as: "metalRate",
        },
        {
          model: db.globalMaterials,
          as: 'globalMaterials',
          through: { attributes: [] }
        }
      ],
      raw: false // Get Sequelize instance
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        slug: req.params.slug
      });
    }

    // Convert to plain object
    let productData = product.toJSON();

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
              return { src: img, alt: productData.name || "Product Image" };
            }
            return {
              src: img.src || "/placeholder.jpg",
              alt: img.alt || productData.name || "Product Image"
            };
          });
        } else if (parsedImages && typeof parsedImages === 'object') {
          productData.images = [{
            src: parsedImages.src || "/placeholder.jpg",
            alt: parsedImages.alt || productData.name || "Product Image"
          }];
        } else {
          throw new Error('Invalid image data');
        }
      } else {
        productData.images = [{
          src: "/placeholder.jpg",
          alt: productData.name || "Product Image"
        }];
      }
    } catch (err) {
      console.error('Error parsing product images:', err);
      productData.images = [{
        src: "/placeholder.jpg",
        alt: productData.name || "Product Image"
      }];
    }

    // Add empty arrays and default values for fields that might be undefined
    productData.youMayAlsoLike = [];
    productData.includedWithPurchase = [];
    productData.badges = [];
    productData.reviews = [];
    productData.priceBreakup = productData.priceBreakup || [];
    productData.currentPrice = String(productData.price || "0");
    productData.originalPrice = String(productData.mrp || "0");

    // Fetch Metal Rates
    try {
      const metalRates = await db.metalRates.findAll();
      productData.metalRates = metalRates;
    } catch (err) {
      console.error("Error fetching metal rates:", err);
      productData.metalRates = [];
    }

    // Fetch Global Materials (Dynamic Customization Options)
    // Only use Global Materials if specific options are NOT set in the JSON fields
    try {
      if (productData.globalMaterials && Array.isArray(productData.globalMaterials)) {

        // Populate availableMetals if empty
        if (!productData.availableMetals || productData.availableMetals.length === 0) {
          productData.availableMetals = productData.globalMaterials
            .filter(m => m.category === 'Metal')
            .map(m => ({ id: String(m.name).toLowerCase().replace(/\s+/g, '-'), name: m.name }));
        }

        // Populate availableDiamonds if empty
        if (!productData.availableDiamonds || productData.availableDiamonds.length === 0) {
          productData.availableDiamonds = productData.globalMaterials
            .filter(m => m.category === 'Diamond')
            .map(m => ({ id: String(m.name).toLowerCase().replace(/\s+/g, '-'), name: m.name }));
        }
      } // closes if (productData.globalMaterials...)

      // Enrich availableMetals with metal rates
      if (productData.availableMetals && Array.isArray(productData.availableMetals) && productData.metalRates) {
        productData.availableMetals = productData.availableMetals.map(metal => {
          const matchingRate = productData.metalRates.find(r => String(r.id) === String(metal.metalRateId));
          return {
            ...metal,
            rate: matchingRate ? matchingRate.rate : 0
          };
        });
      }

    } catch (err) {
      console.error("Error processing global materials/metals:", err);
      // Don't reset here, allow existing data to persist
    }


    res.json(productData);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message
    });
  }
});

// POST /api/products - Add new product
router.post("/", async (req, res) => {
  try {
    const newProduct = await db.products.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/products/:id - Update product
router.put("/:id", async (req, res) => {
  try {
    const updated = await db.products.update(req.body, { where: { id: req.params.id } });
    res.json(updated);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/products/:id - Delete product
router.delete("/:id", async (req, res) => {
  await db.products.destroy({ where: { id: req.params.id } });
  res.status(204).end();
});

export default router;
