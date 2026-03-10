import express from "express";
const router = express.Router();
import db from "../db.js";
import { Op } from "sequelize";
import { transformImageUrl } from "../utils/imageHelper.js";

// GET /api/categories - List all categories
router.get("/", async (req, res) => {
  try {
    const categories = await db.categories.findAll();
    const transformed = categories.map((c) => {
      const data = c.toJSON();
      data.image = transformImageUrl(data.image);
      return data;
    });
    res.json(transformed);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/categories/:slug - Get category details and products
router.get("/:slug", async (req, res) => {
  try {
    let category = await db.categories.findOne({
      where: {
        [Op.or]: [
          { slug: req.params.slug },
          { slug: `${req.params.slug} ` } // Catch trailing spaces from AdminJS input
        ]
      }
    });
    let categoryIds = [];
    let childCategories = null;

    if (!category) {
      // Not a direct category, check if it's a mega category
      const allMegaCats = await db.megaCategories.findAll();
      const megaCategoryMatch = allMegaCats.find((c) =>
        c.name.trim().toLowerCase().replace(/ & /g, "-").replace(/ /g, "-") === req.params.slug
      );

      if (!megaCategoryMatch) return res.status(404).json({ error: "Category not found" });

      // It is a mega category!
      category = {
        dataValues: {
          id: `mega-${megaCategoryMatch.id}`,
          name: megaCategoryMatch.name,
          slug: req.params.slug,
        }
      };

      // Get all child categories
      childCategories = await db.categories.findAll({
        where: { megaCategoryId: megaCategoryMatch.id }
      });
      categoryIds = childCategories.map(c => c.id);

      // If a mega category has no children, we still want a valid OP.in query that returns nothing
      if (categoryIds.length === 0) categoryIds = [-1];
    } else {
      categoryIds = [category.id];
    }

    // Find banner for this category (by url)
    let banner = await db.banners.findOne({ where: { url: `/category/${category.dataValues.slug}` } });
    let bannerImage = banner ? transformImageUrl(banner.image) : null;

    // Attach banner and subcategories to category object
    const categoryWithBanner = {
      ...category.dataValues,
      banner: bannerImage,
      subcategories: childCategories || [] // childCategories is defined if it's a mega category
    };

    categoryWithBanner.subcategories = (categoryWithBanner.subcategories || []).map((sub) => {
      const subData = sub.toJSON ? sub.toJSON() : sub;
      subData.image = transformImageUrl(subData.image);
      return subData;
    });

    // Build filter conditions
    const where = { categoryId: { [Op.in]: categoryIds } };

    // Price filter
    if (req.query.price) {
      // price=under-5000,5000-10000,above-20000
      const priceFilters = req.query.price.split(',');
      const priceConditions = [];
      priceFilters.forEach((range) => {
        if (range === 'under-5000') priceConditions.push({ price: { [Op.lt]: 5000 } });
        if (range === '5000-10000') priceConditions.push({ price: { [Op.gte]: 5000, [Op.lte]: 10000 } });
        if (range === '10000-20000') priceConditions.push({ price: { [Op.gte]: 10000, [Op.lte]: 20000 } });
        if (range === 'above-20000') priceConditions.push({ price: { [Op.gt]: 20000 } });
      });
      if (priceConditions.length > 0) {
        where[Op.or] = priceConditions;
      }
    }

    // Custom Price Range (from Shop For)
    if (req.query.minPrice || req.query.maxPrice) {
      const priceCondition = {};
      if (req.query.minPrice) priceCondition[Op.gte] = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) priceCondition[Op.lte] = parseFloat(req.query.maxPrice);

      // Combine with existing price conditions if any (AND logic)
      if (where.price) {
        where.price = { [Op.and]: [where.price, priceCondition] };
      } else {
        where.price = priceCondition;
      }
    }

    // Build ORDER clause for sort
    let order = [["createdAt", "DESC"]]; // default
    if (req.query.sort === "price_asc") order = [["price", "ASC"]];
    else if (req.query.sort === "price_desc") order = [["price", "DESC"]];
    else if (req.query.sort === "newest") order = [["createdAt", "DESC"]];
    else if (req.query.sort === "name_asc") order = [["name", "ASC"]];

    let products = await db.products.findAll({
      where,
      order,
      include: [
        {
          model: db.globalMaterials,
          as: "globalMaterials",
          through: { attributes: [] }
        }
      ]
    });


    // Parse images field for each product and transform to {src, alt} format
    products = products.map(product => {
      let images = product.images;
      if (typeof images === 'string') {
        try {
          images = JSON.parse(images);
        } catch (e) {
          images = [];
        }
      }

      // Transform to {src, alt} format
      if (Array.isArray(images)) {
        images = images.map(img => {
          if (typeof img === 'string') {
            return { src: transformImageUrl(img), alt: product.name || "Product Image" };
          }
          return {
            src: transformImageUrl(img.src || img || "/placeholder.jpg"),
            alt: img.alt || product.name || "Product Image"
          };
        });
      }

      return { ...product.dataValues, images };
    });

    // Material/style filter in JS
    if (req.query.material || req.query.style || req.query.occasion) {
      products = products.filter((product) => {
        let match = true;

        // Use productSummary instead of productDetails
        const summary = product.productSummary || {};
        const getSummaryValue = (key) => {
          const lower = Object.fromEntries(Object.entries(summary).map(([k, v]) => [k.toLowerCase(), v]));
          return lower[key.toLowerCase()] || "";
        };

        if (req.query.material) {
          const materialFilters = req.query.material.split(',').map((m) => m.toLowerCase());
          const globalMaterials = product.globalMaterials || [];

          const hasGlobalMatch = globalMaterials.some(m => materialFilters.includes(m.name.toLowerCase()));
          const hasSummaryMatch = materialFilters.includes(getSummaryValue("material").toLowerCase());

          if (!hasGlobalMatch && !hasSummaryMatch) {
            match = false;
          }
        }

        if (req.query.style) {
          const styleFilters = req.query.style.split(',').map((s) => s.toLowerCase());
          const prodStyle = getSummaryValue("style");
          if (prodStyle) {
            match = match && styleFilters.includes(prodStyle.toLowerCase());
          } else {
            match = false;
          }
        }

        if (req.query.occasion) {
          const occasionFilters = req.query.occasion.split(',').map((o) => o.toLowerCase());
          const prodOccasion = getSummaryValue("occasion");

          let hasOccasionMatch = false;
          if (prodOccasion) {
            hasOccasionMatch = occasionFilters.includes(prodOccasion.toLowerCase());
          }

          if (!hasOccasionMatch) {
            match = false;
          }
        }
        return match;
      });
    }

    res.json({ category: categoryWithBanner, products });
  } catch (error) {
    console.error(`Error fetching category ${req.params.slug}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
