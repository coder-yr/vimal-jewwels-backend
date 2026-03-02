import AdminJSExpress from "@adminjs/express";
import * as AdminJSSequelize from "@adminjs/sequelize";
import AdminJS from "adminjs";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import MySQLStore from "express-mysql-session";
import session from "express-session";
import { components, loader } from "./component_loader.js";
import db from "./db.js";
dotenv.config();

const DEFAULT_ADMIN = {
  email: process.env.ADMINEMAIL,
  password: process.env.PASSWORD,
};
const authenticate = async (email, password) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
};
// EXPRESS APP
const app = express();
app.use(cors());

app.use("/public", express.static("public"));

AdminJS.registerAdapter(AdminJSSequelize);

const admin = new AdminJS({
  rootPath: "/",
  env: {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    REACT_APP_BACKEND_URL: process.env.REACT_APP_BACKEND_URL,
  },
  locale: {
    translations: {
      en: {
        labels: {
          materials: "Mega Cat. Materials",
        },
        resources: {
          products: {
            properties: {
              makingCharges: "Making Charges (%)",
              metalRateId: "Metal Rate (For Calculation)",
              metalWeight: "Metal Weight (g)",
              grossWeight: "Gross Weight (g)",
            },
          },
        },
      }
    },
  },
  databases: [db],
  settings: {
    defaultPerPage: 500,
  },
  resources: [
    {
      resource: db.pages,
      options: {
        navigation: {
          name: "Content",
          icon: "FileText",
        },
        properties: {
          content: {
            type: "richtext",
            components: {
              edit: components.DescriptionRichText,
            },
          },
        },
      },
    },
    {
      resource: db.settings,
      options: {
        navigation: {
          name: "Settings",
          icon: "Settings",
        },
        properties: {
          contactNumber: { type: "string" },
          contactTiming: { type: "string" },
          supportEmail: { type: "string" },
          facebookLink: { type: "string" },
          instagramLink: { type: "string" },
          twitterLink: { type: "string" },
          youtubeLink: { type: "string" },
          pinterestLink: { type: "string" },
          whatsappLink: { type: "string" },
        },
      },
    },
    {
      resource: db.appointments,
      options: {
        navigation: {
          name: "Inquiries",
          icon: "Calendar",
        },
        listProperties: [
          "name",
          "phone",
          "date",
          "time",
          "status",
          "createdAt",
        ],
        filterProperties: ["name", "phone", "date", "status"],
        editProperties: ["status", "message"],
        showProperties: [
          "name",
          "phone",
          "email",
          "date",
          "time",
          "message",
          "status",
          "createdAt",
        ],
        properties: {
          message: { type: "textarea", isResizable: true },
          status: {
            availableValues: [
              { value: "New", label: "New" },
              { value: "Contacted", label: "Contacted" },
              { value: "Confirmed", label: "Confirmed" },
              { value: "Cancelled", label: "Cancelled" },
              { value: "Closed", label: "Closed" },
            ],
          },
        },
      },
    },
    {
      resource: db.footerConfigs,
      options: {
        navigation: {
          name: "Content",
          icon: "Layout",
        },
        listProperties: ["title", "active", "priority"],
        editProperties: ["title", "priority", "active", "links"],
        properties: {
          links: {
            components: {
              edit: components.LinksEditor,
              list: components.LinksShow,
              show: components.LinksShow,
            },
          },
        },
      },
    },
    {
      resource: db.inquiries,
      options: {
        navigation: {
          name: "Inquiries",
          icon: "MessageCircle", // or 'HelpCircle'
        },
        listProperties: [
          "name",
          "phone",
          "type",
          "email",
          "status",
          "createdAt",
        ],
        filterProperties: ["name", "phone", "type", "status"],
        showProperties: [
          "name",
          "phone",
          "email",
          "type",
          "message",
          "status",
          "createdAt",
        ],
        editProperties: ["status", "message"],
        properties: {
          message: { type: "textarea", isResizable: true },
          status: {
            availableValues: [
              { value: "New", label: "New" },
              { value: "Contacted", label: "Contacted" },
              { value: "Closed", label: "Closed" },
            ],
          },
        },
      },
    },
    {
      resource: db.products,
      options: {
        navigation: {
          name: "Catalog",
          icon: "Heart",
        },
        editProperties: [
          // Basic Info
          "name",
          "slug",
          "active",

          // Pricing & Inventory
          "mrp",
          "price",
          "priceBreakup",
          "taxRate",
          "metalRateId",
          "makingCharges",
          "metalWeight",
          "grossWeight",

          // Categorization
          "categoryId",
          "collectionId",
          "isNewArrival",
          "trendingOrder",
          "listingOrder",

          // Product Details
          "productSummary",
          "metalDetails",
          "diamondDetails",

          // Variants (Sizing & Materials)
          "availableMetals",
          "availableDiamonds",
          "sizes",
          "sizeChart",
          "materials",
          "globalMaterials",

          // Media
          "images",
        ],
        showProperties: [
          "id",
          "name",
          "images",
          "price",
          "active",
          "categoryId",
          "collectionId",
          "metalWeight",
          "grossWeight",
        ],
        listProperties: [
          "name",
          "price",
          "trendingOrder",
          "slug",
          "categoryId",
          "collectionId",
          "active",
        ],
        properties: {
          categoryId: {
            reference: "categories",
          },
          collectionId: {
            reference: "collections",
          },
          productSummary: {
            components: {
              edit: components.KeyValueList,
              show: components.KeyValueView,
              list: components.KeyValueView,
            },
          },
          metalDetails: {
            components: {
              edit: components.KeyValueList,
            },
          },
          // Removed duplicate metalDetails
          metalRateId: {
            label: "Metal Rate (For Calculation)",
            type: "reference",
            reference: "metal_rates",
          },
          makingCharges: {
            type: "number",
            label: "Making Charges (%)",
            isRequired: true,
          },
          diamondDetails: {
            components: {
              edit: components.KeyValueList,
            },
          },
          metalWeight: { type: "string", label: "Metal Weight (g)" },
          grossWeight: { type: "string", label: "Gross Weight (g)" },
          images: {
            components: {
              edit: components.UploadMultipleImage,
            },
          },
          sizeChart: {
            components: {
              edit: components.SizeChart,
            },
          },
          globalMaterials: {
            label: "Materials",
            isVisible: { list: true, filter: true, show: true, edit: true },
            type: "reference",
            reference: "global_materials",
            isArray: true,
          },
          materials: {
            label: "Linked Materials (Mega Menu)", // Distinguished Label
            isVisible: { list: true, filter: true, show: true, edit: true },
            type: "reference",
            reference: "materials",
            isArray: true,
            components: {
              show: components.MaterialsShow,
              list: components.MaterialsShow,
            },
          },
          sizes: {
            components: {
              edit: components.SizeColorStock,
            },
          },
          availableMetals: {
            type: "mixed",
            isArray: true,
            components: {
              edit: components.VariantList,
            },
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              badge: { type: "string" },
              metalRateId: { type: "string", label: "Metal Rate ID" },
              metalWeight: { type: "string", label: "Metal Weight (g)" },
            },
          },
          availableDiamonds: {
            type: "mixed",
            isArray: true,
            components: {
              edit: components.VariantList,
            },
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              badge: { type: "string" },
              grossWeight: { type: "string", label: "Gross Weight (g)" },
            },
          },
          priceBreakup: {
            type: "mixed",
            isArray: true,
            label: "Price Breakup (Overrides Auto-Calculation)",
            components: {
              edit: components.PriceBreakupList,
            },
            properties: {
              label: { type: "string" },
              amount: { type: "string" },
              original: { type: "string" },
            },
          },
        },
        actions: {
          new: {
            before: async (request) => {
              const { payload } = request;
              // TRIM SLUG AND NAME
              if (payload.slug) payload.slug = payload.slug.trim();
              if (payload.name) payload.name = payload.name.trim();

              // Auto-calculate Price if missing/zero and Metal Rate provided
              const numericPrice = parseFloat(payload.price);
              const isPriceMissingOrZero = isNaN(numericPrice) || numericPrice === 0;

              if (isPriceMissingOrZero && payload.metalRateId) {
                try {
                  const metalRate = await db.metalRates.findByPk(
                    payload.metalRateId,
                  );
                  if (metalRate) {
                    const rate = parseFloat(metalRate.rate);
                    // Extract weight (handle "10 gms" string format or numbers)
                    let weight = parseFloat(
                      payload.grossWeight || payload.metalWeight || 0,
                    );
                    if (isNaN(weight)) {
                      // Try referencing the numeric part if it's a string
                      const wStr = (
                        payload.grossWeight ||
                        payload.metalWeight ||
                        ""
                      ).toString();
                      const match = wStr.match(/[\d\.]+/);
                      if (match) weight = parseFloat(match[0]);
                    }

                    const makingPercentage = parseFloat(
                      payload.makingCharges || 0,
                    );

                    if (rate > 0 && weight > 0) {
                      const basePrice = rate * weight;
                      const totalPrice =
                        basePrice + (basePrice * makingPercentage) / 100;

                      payload.price = String(Math.round(totalPrice));

                      const numericMrp = parseFloat(payload.mrp);
                      if (isNaN(numericMrp) || numericMrp === 0) {
                        payload.mrp = payload.price;
                      }

                    }
                  }
                } catch (error) {
                  console.error("Error auto-calculating price:", error);
                }
              }

              // --- VALIDATION FOR PRICE BREAKUP ---
              const extractUniqueArray = (prefix, fields) => {
                const items = [];
                let maxIndex = -1;
                Object.keys(payload).forEach((key) => {
                  if (key.startsWith(`${prefix}.`)) {
                    const parts = key.split(".");
                    const idx = parseInt(parts[1], 10);
                    if (!isNaN(idx) && idx > maxIndex) maxIndex = idx;
                  }
                });
                for (let i = 0; i <= maxIndex; i++) {
                  const item = {};
                  let hasData = false;
                  fields.forEach((field) => {
                    const val = payload[`${prefix}.${i}.${field}`];
                    if (val !== undefined) {
                      item[field] = val;
                      hasData = true;
                    }
                  });
                  if (hasData) items.push(item);
                }
                return items;
              };

              /* 
              const pbItems = extractUniqueArray("priceBreakup", ["amount"]);
              if (pbItems.length > 0) {
                const totalBreakup = pbItems.reduce(
                  (sum, item) => sum + (parseFloat(item.amount) || 0),
                  0,
                );

                const finalProductPrice = parseFloat(payload.price) || 0;

                if (totalBreakup > finalProductPrice) {
                  throw new AdminJS.ValidationError({
                    priceBreakup: {
                      message: `Price breakup total (₹${totalBreakup}) cannot exceed the product price (₹${finalProductPrice}).`,
                    },
                  });
                }
              }
              */

              return request;
            },
            after: async (response, request, context) => {
              const record = response.record;

              // Manual Save Override

              // Extract materials from payload.
              let materialIds = [];
              const payload = request.payload || {};

              if (payload.materials) {
                if (Array.isArray(payload.materials)) {
                  materialIds = payload.materials;
                } else if (typeof payload.materials === "object") {
                  // Sometimes array-like object {0: '1', 1: '5'}
                  materialIds = Object.values(payload.materials);
                }
              } else {
                // Check for flattened keys
                Object.keys(payload).forEach((key) => {
                  if (key.startsWith("materials.")) {
                    materialIds.push(payload[key]);
                  }
                });
              }

              // parseInt
              const ids = materialIds
                .map((id) => parseInt(id, 10))
                .filter((id) => !isNaN(id));

              // --- MANUAL SAVE FOR PRODUCT SUMMARY & DETAILS JSON ---
              if (record && record.params.id) {
                try {
                  const payload = request.payload || {};

                  // Helper to extract array from flattened keys
                  // Helper to extract array from flattened keys OR direct array
                  const extractArray = (prefix, fields = ["key", "value"]) => {
                    // 1. Check if payload[prefix] is already an array (from onChange(prop, array))
                    if (payload[prefix]) {
                      let data = payload[prefix];
                      // Try parsing if string
                      if (typeof data === "string") {
                        try {
                          data = JSON.parse(data);
                        } catch (e) { }
                      }

                      if (Array.isArray(data)) {
                        return data.map((item) => {
                          const newItem = {};
                          fields.forEach((f) => {
                            if (item[f] !== undefined) newItem[f] = item[f];
                          });
                          return newItem;
                        });
                      }
                    }

                    const items = [];
                    // Find max index
                    let maxIndex = -1;
                    Object.keys(payload).forEach((key) => {
                      if (key.startsWith(`${prefix}.`)) {
                        const parts = key.split(".");
                        const idx = parseInt(parts[1], 10);
                        if (!isNaN(idx) && idx > maxIndex) maxIndex = idx;
                      }
                    });

                    for (let i = 0; i <= maxIndex; i++) {
                      const item = {};
                      let hasData = false;
                      fields.forEach((field) => {
                        const val = payload[`${prefix}.${i}.${field}`];
                        if (val !== undefined) {
                          item[field] = val;
                          hasData = true;
                        }
                      });
                      if (hasData) items.push(item);
                    }
                    return items;
                  };

                  const summaryItems = extractArray("productSummary", [
                    "key",
                    "value",
                  ]);
                  const detailItems = extractArray("productDetails", [
                    "key",
                    "value",
                  ]);
                  const metalItems = extractArray("availableMetals", [
                    "id",
                    "name",
                    "badge",
                    "metalRateId",
                    "metalWeight",
                  ]);
                  const diamondItems = extractArray("availableDiamonds", [
                    "id",
                    "name",
                    "badge",
                  ]);


                  const pToUpdate = {};
                  if (summaryItems.length > 0)
                    pToUpdate.productSummary = summaryItems;
                  if (detailItems.length > 0)
                    pToUpdate.productDetails = detailItems;
                  if (metalItems.length > 0)
                    pToUpdate.availableMetals = metalItems;
                  if (diamondItems.length > 0)
                    pToUpdate.availableDiamonds = diamondItems;

                  if (Object.keys(pToUpdate).length > 0) {
                    await db.products.update(pToUpdate, {
                      where: { id: record.params.id },
                    });
                  }
                } catch (err) {
                  console.error("Error manual saving JSON fields:", err);
                }
              }

              // If record exists, manually save
              // Update: We should always update if payload has materials keys, to handle unselect all (empty array)
              // But AdminJS might not send empty array if field untouched?
              // Default behavior: if 'materials' key exists in payload (even empty), we update.

              if (record && record.params.id) {
                try {
                  const product = await db.products.findByPk(record.params.id);
                  if (product) {
                    await product.setMaterials(ids);
                  }
                } catch (err) {
                  console.error("❌ Error manual saving materials:", err);
                }

                // --- MANAUL SAVE GLOBAL MATERIALS ---
                try {
                  let globalMaterialIds = [];
                  const payload = request.payload || {};
                  // Check payload
                  if (payload.globalMaterials) {
                    if (Array.isArray(payload.globalMaterials)) {
                      globalMaterialIds = payload.globalMaterials;
                    } else if (typeof payload.globalMaterials === "object") {
                      globalMaterialIds = Object.values(
                        payload.globalMaterials,
                      );
                    }
                  } else {
                    Object.keys(payload).forEach((key) => {
                      if (key.startsWith("globalMaterials.")) {
                        globalMaterialIds.push(payload[key]);
                      }
                    });
                  }

                  const gmIds = globalMaterialIds
                    .map((id) => parseInt(id, 10))
                    .filter((id) => !isNaN(id));

                  // Only update if payload had keys related to globalMaterials or if we want to force update
                  // AdminJS usually sends empty keys if field is cleared? Verify.
                  // For now, if we found any keys or if payload implies an update attempt.
                  // Safer: Always update if we're in edit mode and the field is visible.

                  if (gmIds.length >= 0) {
                    // Even empty array to clear
                    await product.setGlobalMaterials(gmIds);
                  }
                } catch (err) {
                  console.error(
                    "❌ Error manual saving global materials:",
                    err,
                  );
                }
              }

              return response;
            },
          },
          edit: {
            before: async (request) => {
              if (request.method.toLowerCase() === "post") {
                // Only on save, not on get
                const { payload } = request;
                // TRIM SLUG AND NAME
                if (payload.slug) payload.slug = payload.slug.trim();
                if (payload.name) payload.name = payload.name.trim();

                // Auto-calculate Price if missing/zero and Metal Rate provided
                const numericPrice = parseFloat(payload.price);
                const isPriceMissingOrZero = isNaN(numericPrice) || numericPrice === 0;

                if (isPriceMissingOrZero && payload.metalRateId) {
                  try {
                    const metalRate = await db.metalRates.findByPk(
                      payload.metalRateId,
                    );
                    if (metalRate) {
                      const rate = parseFloat(metalRate.rate);
                      let weight = parseFloat(
                        payload.grossWeight || payload.metalWeight || 0,
                      );
                      if (isNaN(weight)) {
                        const wStr = (
                          payload.grossWeight ||
                          payload.metalWeight ||
                          ""
                        ).toString();
                        const match = wStr.match(/[\d\.]+/);
                        if (match) weight = parseFloat(match[0]);
                      }
                      const makingPercentage = parseFloat(
                        payload.makingCharges || 0,
                      );

                      if (rate > 0 && weight > 0) {
                        const basePrice = rate * weight;
                        const totalPrice =
                          basePrice + (basePrice * makingPercentage) / 100;
                        payload.price = String(Math.round(totalPrice));

                        const numericMrp = parseFloat(payload.mrp);
                        if (isNaN(numericMrp) || numericMrp === 0) {
                          payload.mrp = payload.price;
                        }
                      }
                    }
                  } catch (error) {
                    console.error("Error auto-calculating price:", error);
                  }
                }

                // --- VALIDATION FOR PRICE BREAKUP ---
                const extractUniqueArray = (prefix, fields) => {
                  const items = [];
                  let maxIndex = -1;
                  Object.keys(payload).forEach((key) => {
                    if (key.startsWith(`${prefix}.`)) {
                      const parts = key.split(".");
                      const idx = parseInt(parts[1], 10);
                      if (!isNaN(idx) && idx > maxIndex) maxIndex = idx;
                    }
                  });
                  for (let i = 0; i <= maxIndex; i++) {
                    const item = {};
                    let hasData = false;
                    fields.forEach((field) => {
                      const val = payload[`${prefix}.${i}.${field}`];
                      if (val !== undefined) {
                        item[field] = val;
                        hasData = true;
                      }
                    });
                    if (hasData) items.push(item);
                  }
                  return items;
                };

                /*
                const pbItems = extractUniqueArray("priceBreakup", ["amount"]);
                if (pbItems.length > 0) {
                  const totalBreakup = pbItems.reduce(
                    (sum, item) => sum + (parseFloat(item.amount) || 0),
                    0,
                  );

                  // In edit mode, if price isn't in payload, we assume it hasn't somehow become 0.
                  // Wait, we just calculated payload.price above if it was missing/0. 
                  const finalProductPrice = parseFloat(payload.price);

                  if (!isNaN(finalProductPrice) && totalBreakup > finalProductPrice) {
                    throw new AdminJS.ValidationError({
                      priceBreakup: {
                        message: `Price breakup total (₹${totalBreakup}) cannot exceed the product price (₹${finalProductPrice}).`,
                      },
                    });
                  }
                }
                */
              }
              return request;
            },
            after: async (response, request, context) => {
              const record = response.record;

              // --- MANUAL POPULATE ON GET (Edit View) ---
              if (
                request.method.toLowerCase() === "get" &&
                record &&
                record.params.id
              ) {
                try {
                  const p = await db.products.findByPk(record.params.id);
                  if (p) {
                    // Manual unflatten productDetails
                    if (p.productDetails && Array.isArray(p.productDetails)) {
                      record.params["productDetails"] = p.productDetails;
                      p.productDetails.forEach((item, i) => {
                        record.params[`productDetails.${i}.key`] = item.key;
                        record.params[`productDetails.${i}.value`] = item.value;
                      });
                    }

                    // Manual unflatten productSummary
                    if (p.productSummary && Array.isArray(p.productSummary)) {
                      record.params["productSummary"] = p.productSummary;
                      p.productSummary.forEach((item, i) => {
                        record.params[`productSummary.${i}.key`] = item.key;
                        record.params[`productSummary.${i}.value`] = item.value;
                      });
                    }

                    // Manual unflatten availableMetals
                    if (p.availableMetals && Array.isArray(p.availableMetals)) {
                      p.availableMetals.forEach((item, i) => {
                        record.params[`availableMetals.${i}.id`] = item.id;
                        record.params[`availableMetals.${i}.name`] = item.name;
                        record.params[`availableMetals.${i}.badge`] =
                          item.badge;
                      });
                    }

                    // Manual unflatten availableDiamonds
                    if (
                      p.availableDiamonds &&
                      Array.isArray(p.availableDiamonds)
                    ) {
                      p.availableDiamonds.forEach((item, i) => {
                        record.params[`availableDiamonds.${i}.id`] = item.id;
                        record.params[`availableDiamonds.${i}.name`] =
                          item.name;
                        record.params[`availableDiamonds.${i}.badge`] =
                          item.badge;
                      });
                    }

                    // Manual unflatten priceBreakup
                    if (p.priceBreakup && Array.isArray(p.priceBreakup)) {
                      p.priceBreakup.forEach((item, i) => {
                        record.params[`priceBreakup.${i}.label`] = item.label;
                        record.params[`priceBreakup.${i}.amount`] = item.amount;
                        record.params[`priceBreakup.${i}.original`] =
                          item.original;
                      });
                    }
                  }
                  const product = await db.products.findByPk(record.params.id, {
                    include: [
                      {
                        model: db.globalMaterials,
                        as: "globalMaterials",
                        through: { attributes: [] },
                      },
                    ],
                  });
                  if (
                    product &&
                    product.globalMaterials &&
                    product.globalMaterials.length > 0
                  ) {
                    const gms = product.globalMaterials.map((m) => m.toJSON());
                    record.populated = record.populated || {};
                    record.populated = record.populated || {};
                    // Map params for frontend form
                    gms.forEach((m, i) => {
                      record.params[`globalMaterials.${i}`] = m.id;
                      record.populated[`globalMaterials.${i}`] = m;
                    });
                  }
                } catch (err) {
                  console.error(
                    "Error manual populating global materials in edit:",
                    err,
                  );
                }
              }

              // Manual Save Override

              // Extract materials from payload.
              let materialIds = [];
              let shouldUpdateMaterials = false;
              const payload = request.payload || {};

              if (payload.materials !== undefined) {
                shouldUpdateMaterials = true;
                if (Array.isArray(payload.materials)) {
                  materialIds = payload.materials;
                } else if (
                  typeof payload.materials === "object" &&
                  payload.materials !== null
                ) {
                  materialIds = Object.values(payload.materials);
                }
              } else {
                // Check for flattened keys
                const hasFlattenedKeys = Object.keys(payload).some((key) =>
                  key.startsWith("materials."),
                );
                if (hasFlattenedKeys) {
                  shouldUpdateMaterials = true;
                  Object.keys(payload).forEach((key) => {
                    if (key.startsWith("materials.")) {
                      materialIds.push(payload[key]);
                    }
                  });
                }
              }

              // parseInt
              const ids = materialIds
                .map((id) => parseInt(id, 10))
                .filter((id) => !isNaN(id));

              // --- MANUAL SAVE FOR PRODUCT SUMMARY & DETAILS JSON ---
              if (
                record &&
                record.params.id &&
                request.method.toLowerCase() === "post"
              ) {
                try {
                  const payload = request.payload || {};

                  // Helper to extract array from flattened keys OR direct array
                  const extractArray = (prefix, fields = ["key", "value"]) => {
                    // Helper to extract array from flattened payload or direct array


                    // 1. Check if payload[prefix] is already an array (from onChange(prop, array))
                    if (payload[prefix] && Array.isArray(payload[prefix])) {
                      return payload[prefix].map((item) => {
                        const newItem = {};
                        fields.forEach((f) => {
                          if (item[f] !== undefined) newItem[f] = item[f];
                        });
                        return newItem;
                      });
                    }

                    const items = [];
                    // Find max index
                    let maxIndex = -1;
                    Object.keys(payload).forEach((key) => {
                      if (key.startsWith(`${prefix}.`)) {
                        const parts = key.split(".");
                        const idx = parseInt(parts[1], 10);
                        if (!isNaN(idx) && idx > maxIndex) maxIndex = idx;
                      }
                    });

                    for (let i = 0; i <= maxIndex; i++) {
                      const item = {};
                      let hasData = false;
                      fields.forEach((field) => {
                        const val = payload[`${prefix}.${i}.${field}`];
                        if (val !== undefined) {
                          item[field] = val;
                          hasData = true;
                        }
                      });
                      if (hasData) items.push(item);
                    }
                    return items;
                  };

                  const summaryItems = extractArray("productSummary", [
                    "key",
                    "value",
                  ]);
                  const detailItems = extractArray("productDetails", [
                    "key",
                    "value",
                  ]);
                  const metalItems = extractArray("availableMetals", [
                    "id",
                    "name",
                    "badge",
                    "metalRateId",
                    "metalWeight",
                  ]);
                  const diamondItems = extractArray("availableDiamonds", [
                    "id",
                    "name",
                    "badge",
                  ]);
                  const priceBreakupItems = extractArray("priceBreakup", [
                    "label",
                    "amount",
                    "original",
                  ]);


                  // --- VALIDATION: Price Breakup Total must match Product Price ---
                  /*
                  if (priceBreakupItems.length > 0) {
                    const totalBreakup = priceBreakupItems.reduce(
                      (sum, item) => sum + (parseFloat(item.amount) || 0),
                      0,
                    );
                    // Use updated price from record (edit action has completed)
                    const productPrice = parseFloat(record.params.price || 0);


                    if (Math.abs(totalBreakup - productPrice) > 1) {
                      // 1 rupee tolerance
                      throw new Error(
                        `Validation Failed: Price Breakup Total (₹${totalBreakup}) must match Product Price (₹${productPrice}). Please correct the values.`,
                      );
                    }
                  }
                  */

                  const pToUpdate = {};
                  if (summaryItems.length > 0)
                    pToUpdate.productSummary = summaryItems;
                  if (detailItems.length > 0)
                    pToUpdate.productDetails = detailItems;
                  if (metalItems.length > 0)
                    pToUpdate.availableMetals = metalItems;
                  if (diamondItems.length > 0)
                    pToUpdate.availableDiamonds = diamondItems;
                  if (priceBreakupItems.length >= 0)
                    pToUpdate.priceBreakup = priceBreakupItems;


                  if (Object.keys(pToUpdate).length > 0) {
                    await db.products.update(pToUpdate, {
                      where: { id: record.params.id },
                    });
                  }
                } catch (err) {
                  console.error("Error manual saving JSON fields:", err);
                }
              }

              // --- MANUAL SAVE MATERIALS ---
              if (record && record.params.id && shouldUpdateMaterials) {
                try {
                  const product = await db.products.findByPk(record.params.id);
                  if (product) {
                    await product.setMaterials(ids);
                  }
                } catch (err) {
                  console.error("❌ Error manual saving materials:", err);
                }
              }

              // --- MANUAL SAVE GLOBAL MATERIALS ---
              try {
                let globalMaterialIds = [];
                let shouldUpdateGlobalMaterials = false;
                const payload = request.payload || {};

                // Check payload (improved check)
                if (payload.globalMaterials !== undefined) {
                  shouldUpdateGlobalMaterials = true;
                  if (Array.isArray(payload.globalMaterials)) {
                    globalMaterialIds = payload.globalMaterials;
                  } else if (
                    typeof payload.globalMaterials === "object" &&
                    payload.globalMaterials !== null
                  ) {
                    globalMaterialIds = Object.values(payload.globalMaterials);
                  }
                } else {
                  const hasGMKeys = Object.keys(payload).some((key) =>
                    key.startsWith("globalMaterials."),
                  );
                  if (hasGMKeys) {
                    shouldUpdateGlobalMaterials = true;
                    Object.keys(payload).forEach((key) => {
                      if (key.startsWith("globalMaterials.")) {
                        globalMaterialIds.push(payload[key]);
                      }
                    });
                  }
                }

                if (shouldUpdateGlobalMaterials && record && record.params.id) {
                  const gmIds = globalMaterialIds
                    .map((id) => parseInt(id, 10))
                    .filter((id) => !isNaN(id));
                  if (product) {
                    await product.setGlobalMaterials(gmIds);
                  }
                }
              } catch (err) {
                console.error("❌ Error manual saving global materials:", err);
              }

              return response;
            },
          },
          show: {
            after: async (response, request, context) => {
              // Manual Population Override
              const record = response.record;

              if (record && record.params.id) {
                try {
                  const product = await db.products.findByPk(record.params.id, {
                    include: [
                      {
                        model: db.materials,
                        as: "materials",
                        through: { attributes: [] },
                      },
                    ],
                  });

                  if (product) {
                  }

                  if (
                    product &&
                    product.materials &&
                    product.materials.length > 0
                  ) {
                    const materials = product.materials.map((m) => m.toJSON());
                    record.populated = record.populated || {};
                    record.populated.materials = materials;

                    // Also backfill params just in case for flattening fallback
                    materials.forEach((m, i) => {
                      record.params[`materials.${i}.id`] = m.id;
                      record.params[`materials.${i}.name`] = m.name;
                    });
                  } else {
                  }

                  // --- MANUAL POPULATE GLOBAL MATERIALS ---
                  const productGM = await db.products.findByPk(
                    record.params.id,
                    {
                      include: [
                        {
                          model: db.globalMaterials,
                          as: "globalMaterials",
                          through: { attributes: [] },
                        },
                      ],
                    },
                  );

                  if (
                    productGM &&
                    productGM.globalMaterials &&
                    productGM.globalMaterials.length > 0
                  ) {
                    const gms = productGM.globalMaterials.map((m) =>
                      m.toJSON(),
                    );
                    record.populated = record.populated || {};
                    record.populated.globalMaterials = gms;

                    gms.forEach((m, i) => {
                      record.params[`globalMaterials.${i}.id`] = m.id;
                      record.params[`globalMaterials.${i}.name`] = m.name; // Display title
                    });
                  }
                } catch (err) {
                  console.error("Error manual populating materials:", err);
                }
              }
              return response;
            },
          },
        },
      },
    },

    {
      resource: db.collections,
      options: {
        id: "collections",
        navigation: {
          name: "Catalog",
          icon: "Layers",
        },
        listProperties: ["name", "image", "active"],
        properties: {
          image: {
            components: {
              edit: components.UploadSingleImage,
              show: components.ViewSingleImage,
              list: components.ViewSingleImage,
            },
          },
        },
      },
    },
    {
      resource: db.sectionImages,
      options: {
        id: "Homepage Tabs",
        navigation: {
          name: "Content",
          icon: "Layout",
        },
        listProperties: ["name", "image", "order", "active"],
        editProperties: ["name", "image", "order", "active"],
        showProperties: ["name", "image", "order", "active"],
        properties: {
          name: {
            label: "Tab Name",
          },
          order: {
            label: "Display Order",
          },
          image: {
            label: "Full Width Banner Image",
            components: {
              edit: components.UploadSingleImage,
              show: components.ViewSingleImage,
              list: components.ViewSingleImage,
            },
          },
        },
      },
    },
    {
      resource: db.homeGifts,
      options: {
        navigation: {
          name: "Content",
          icon: "Gift",
        },
        listProperties: ["name", "icon", "order", "active"],
        properties: {
          // icon: {
          //   availableValues: [
          //     { value: 'Cake', label: 'Cake' },
          //     { value: 'Calendar', label: 'Calendar' },
          //     { value: 'Star', label: 'Star' },
          //     { value: 'Gift', label: 'Gift' },
          //     { value: 'Baby', label: 'Baby' },
          //     { value: 'Sparkles', label: 'Sparkles' },
          //   ]
          // }
        },
      },
    },
    // Admin logs resource
    {
      resource: db.videos,
      options: {
        navigation: {
          name: "Content",
          icon: "Video",
        },
        listProperties: ["title", "youtubeUrl", "videoFile", "active"],
        properties: {
          videoFile: {
            components: {
              edit: components.UploadVideo,
              show: components.UploadVideo, // Using preview from upload component or I could make a ViewVideo component. UploadVideo has preview.
              list: components.UploadVideo, // List might be too big, but let's see. Maybe remove from list.
            },
          },
        },
      },
    },
    {
      resource: db.adminLogs,
      options: {
        navigation: {
          name: "Settings",
          icon: "FileText",
        },
        listProperties: [
          "adminEmail",
          "action",
          "resource",
          "details",
          "createdAt",
        ],
        properties: {},
      },
    },
    {
      resource: db.footerConfigs,
      options: {
        id: "footer_configs",
        navigation: {
          name: "Content",
          icon: "Layout",
        },
        listProperties: ["title", "priority", "active", "createdAt"],
        editProperties: ["title", "priority", "active", "links"],
        showProperties: ["title", "priority", "active", "links"],
        properties: {
          title: { isTitle: true },
          links: {
            components: {
              edit: components.LinksEditor,
              show: components.LinksShow,
            },
            type: "mixed",
            isArray: true,
          },
        },
      },
    },
    {
      resource: db.users,
      options: {
        navigation: {
          name: "Users",
          icon: "Users",
        },
        listProperties: ["id", "username", "email", "createdAt"],
        filterProperties: ["email", "username"],
        editProperties: ["username", "email", "phone"], // No orders in edit
        showProperties: [
          "id",
          "username",
          "email",
          "phone",
          "createdAt",
          "ordersList",
        ], // Added ordersList
        properties: {
          ordersList: {
            components: {
              show: components.UserOrders,
            },
            isVisible: {
              show: true,
              view: true,
              edit: false,
              list: false,
              filter: false,
            },
          },
        },
        actions: {
          show: {
            after: async (response, request, context) => {
              const record = response.record;
              if (record && record.params.id) {
                try {
                  const orders = await db.orders.findAll({
                    where: { userId: record.params.id },
                    order: [["createdAt", "DESC"]],
                  });
                  record.populated = record.populated || {};
                  record.populated.orders = orders.map((o) => o.toJSON());
                } catch (e) {
                  console.error("Error fetching user orders:", e);
                }
              }
              return response;
            },
          },
        },
      },
    },
    {
      resource: db.orders,
      options: {
        navigation: {
          name: "Sales",
          icon: "ShoppingBag",
        },
        listProperties: [
          "id",
          "userId",
          "total",
          "status",
          "paymentMethod",
          "createdAt",
        ],
        showProperties: [
          "id",
          "userId",
          "items",
          "total",
          "status",
          "address",
          "paymentMethod",
          "paymentId",
          "createdAt",
        ],
        filterProperties: ["userId", "status", "paymentMethod"],
        editProperties: ["status", "paymentMethod", "paymentId"],
        properties: {
          id: {
            label: "Order No.",
          },
          total: {
            type: "currency",
            props: {
              symbol: "₹",
              decimalSeparator: ".",
              groupSeparator: ",",
            }, // Note: AdminJS 'currency' type might imply simple number formatting or I might need to rely on 'number' with decoration.
            // Actually AdminJS built-in types: string, number, boolean, date, datetime, ... 'currency' is standard in some versions but 'number' is safer.
            // Let's stick to 'number' but adding custom format component is safer if 'currency' isn't fully supported.
            // However, usually `type: 'currency'` works in AdminJS. Let's try `type: 'currency'`.
          },
          userId: {
            reference: "users",
            label: "Customer",
          },
          items: {
            label: "Order Items",
            components: {
              show: components.OrderItems,
              list: components.OrderItems,
            },
          },
          address: {
            label: "Shipping Address",
            components: {
              show: components.OrderAddress,
            },
          },
          status: {
            label: "Order Status",
            availableValues: [
              { value: "Processing", label: "Processing" },
              { value: "Shipped", label: "Shipped" },
              { value: "Delivered", label: "Delivered" },
              { value: "Cancelled", label: "Cancelled" },
            ],
          },
          paymentMethod: {
            label: "Payment Method",
          },
          createdAt: {
            label: "Placed On",
          },
        },
      },
    },
    {
      resource: db.categories,
      options: {
        id: "categories",
        navigation: {
          name: "Catalog",
          icon: "Grid",
        },
        listProperties: ["name", "megaCategoryId", "image", "slug"],
        editProperties: ["name", "megaCategoryId", "slug", "image", "showOnHome", "homeOrder"],
        showProperties: ["name", "megaCategoryId", "slug", "image", "showOnHome", "homeOrder"],
        properties: {
          megaCategoryId: {
            label: "Parent Mega Category (Optional)",
            reference: "mega_categories",
          },
          image: {
            components: {
              edit: components.UploadSingleImage,
              show: components.ViewSingleImage,
              list: components.ViewSingleImage,
            },
          },
        },
      },
    },

    {
      resource: db.megaCategories,
      options: {
        navigation: {
          name: "Catalog",
          icon: "Menu",
        },
        actions: {
          show: {
            component: components.MegaMenuShow,
          },
        },
        listProperties: ["name", "active", "showHomeShopByCategory"],
        properties: {
          image: {
            components: {
              edit: components.UploadSingleImage,
              show: components.ViewSingleImage,
            },
          },
        },
      },
    },
    {
      resource: db.styles,
      options: {
        navigation: false,
        listProperties: ["name", "megaCategoryId", "active", "image"],
        filterProperties: ["name", "megaCategoryId", "active"],
        properties: {
          megaCategoryId: {
            reference: "mega_categories",
          },
          image: {
            components: {
              edit: components.UploadSingleImage,
              show: components.ViewSingleImage,
              list: components.ViewSingleImage,
            },
          },
        },
      },
    },
    {
      resource: db.materials,
      options: {
        id: "materials",
        navigation: {
          name: "Catalog",
          icon: "List", // Distinct from 'Layers' used by Global Materials
        },
        listProperties: ["name", "megaCategoryId", "active", "image"],
        filterProperties: ["name", "megaCategoryId", "active"],
        properties: {
          megaCategoryId: {
            reference: "mega_categories",
          },
          image: {
            components: {
              edit: components.UploadSingleImage,
              show: components.ViewSingleImage,
              list: components.ViewSingleImage,
            },
          },
        },
      },
    },
    {
      resource: db.shopFor,
      options: {
        id: "shopfor",
        navigation: false,
        listProperties: ["startPrice", "endPrice", "megaCategoryId", "active"],
        filterProperties: [
          "startPrice",
          "endPrice",
          "megaCategoryId",
          "active",
        ],
        properties: {
          megaCategoryId: {
            reference: "mega_categories",
          },
        },
      },
    },
    {
      resource: db.occasions,
      options: {
        id: "occasions",
        navigation: false,
        listProperties: ["name", "megaCategoryId", "active", "image"],
        filterProperties: ["name", "megaCategoryId", "active"],
        properties: {
          megaCategoryId: {
            reference: "mega_categories",
          },
          image: {
            components: {
              edit: components.UploadSingleImage,
              show: components.ViewSingleImage,
              list: components.ViewSingleImage,
            },
          },
        },
      },
    },
    {
      resource: db.banners,
      options: {
        navigation: {
          name: "Content",
          icon: "Image",
        },
        listProperties: ["image", "active", "url"],
        properties: {
          image: {
            components: {
              edit: components.UploadSingleImage,
              list: components.ViewSingleImage,
              show: components.ViewSingleImage,
            },
          },
        },
      },
    },
    {
      resource: db.subBanners,
      options: {
        navigation: {
          name: "Content",
          icon: "Image",
        },
        listProperties: ["heading", "image", "active", "url"],
        properties: {
          image: {
            components: {
              edit: components.UploadSingleImage,
              list: components.ViewSingleImage,
              show: components.ViewSingleImage,
            },
          },
        },
      },
    },
    {
      resource: db.home,
      options: {
        id: "Home",
        navigation: {
          name: "Content",
          icon: "Home",
        },
        listProperties: ["id"],
        editProperties: [
          "sparkleSeekerConfig.title",
          "sparkleSeekerConfig.description",
          "sparkleSeekerConfig.buttonText",
        ],
        properties: {
          "sparkleSeekerConfig.title": {
            label: "Sparkle Seeker Config Title",
          },
          "sparkleSeekerConfig.description": {
            label: "Sparkle Seeker Config Description",
            type: "textarea",
          },
          "sparkleSeekerConfig.buttonText": {
            label: "Sparkle Seeker Config Button Text",
          },
        },
        actions: {
          edit: {
            after: async (response, request, context) => {
              const { record } = response;
              const { payload } = request;

              if (
                record &&
                record.params.id &&
                request.method.toLowerCase() === "post"
              ) {
                try {
                  // Manual Save for Modern Section Config to ensure persistence
                  // Check for modernSectionConfig.* keys in payload
                  const modernKeys = Object.keys(payload).filter((k) =>
                    k.startsWith("modernSectionConfig."),
                  );
                  if (modernKeys.length > 0) {
                    console.log(
                      "[Home Manual Save] Found Modern keys:",
                      modernKeys,
                    );
                    const home = await db.home.findByPk(record.params.id);
                    if (home) {
                      let config = home.modernSectionConfig || {};
                      // Ensure it's an object (sometimes DB returns JSON string if raw?)
                      if (typeof config === "string") {
                        try {
                          config = JSON.parse(config);
                        } catch (e) { }
                      }

                      modernKeys.forEach((key) => {
                        const field = key.split(".")[1]; // modernSectionConfig.smallImage1 -> smallImage1
                        if (field) {
                          config[field] = payload[key];
                        }
                      });

                      home.modernSectionConfig = config;
                      // Force update
                      home.changed("modernSectionConfig", true);
                      await home.save();
                      console.log(
                        "[Home Manual Save] Successfully updated Modern Config.",
                      );
                    }
                  }

                  // Do the same for Traditional just in case
                  const traditionalKeys = Object.keys(payload).filter((k) =>
                    k.startsWith("traditionalSectionConfig."),
                  );
                  if (traditionalKeys.length > 0) {
                    const home = await db.home.findByPk(record.params.id); // Re-fetch or reuse? Reuse if sequential, but let's re-fetch to be safe/simple or modify same instance
                    // Better: modify the same instance if we can, but simpler to just fetch-update
                    if (home) {
                      let config = home.traditionalSectionConfig || {};
                      if (typeof config === "string") {
                        try {
                          config = JSON.parse(config);
                        } catch (e) { }
                      }

                      traditionalKeys.forEach((key) => {
                        const field = key.split(".")[1];
                        if (field) config[field] = payload[key];
                      });
                      home.traditionalSectionConfig = config;
                      home.changed("traditionalSectionConfig", true);
                      await home.save();
                    }
                  }
                } catch (error) {
                  console.error("[Home Manual Save] Error:", error);
                }
              }
              return response;
            },
          },
        },
      },
    },

    {
      resource: db.runningList,
      options: {
        navigation: {
          name: "Content",
          icon: "Type",
        },
        listProperties: ["texts"],
        properties: {
          texts: {
            components: {
              edit: components.CreateStringList,
              list: components.ViewStringList,
              show: components.ViewStringList,
            },
          },
        },
      },
    },
    {
      resource: db.metalRates,
      options: {
        id: "metal_rates",
        navigation: {
          name: "Settings",
          icon: "Settings",
        },
        properties: {
          rate: {
            type: "currency",
            props: { symbol: "₹" },
          },
        },
      },
    },
    {
      resource: db.productMaterials,
      options: { navigation: false },
    },
    {
      resource: db.productGlobalMaterials,
      options: { navigation: false },
    },
    {
      resource: db.globalMaterials,
      options: {
        id: "global_materials",
        navigation: {
          name: "Catalog",
          icon: "Layers",
        },
        listProperties: ["name", "category", "active"],
        filterProperties: ["name", "category", "active"],
        properties: {
          name: { isTitle: true },
          category: {
            availableValues: [
              { value: "Metal", label: "Metal" },
              { value: "Diamond", label: "Diamond" },
              { value: "Gemstone", label: "Gemstone" },
              { value: "Other", label: "Other" },
            ],
          },
        },
      },
    },
  ],
  loginPath: "/login",
  branding: {
    companyName: "Vimal Jewellers",
    favicon: "./public/logo.svg",
    logo: "./public/logo.svg",
    withMadeWithLove: false,
  },
  version: {
    admin: false,
    app: "1.0.0",
  },
  componentLoader: loader,
  dashboard: {
    component: components.DashboardComponent,
  },
  assets: {
    styles: ["/public/custom_style.css"],
  },
  logoutPath: "/logout",
});

await admin.watch();

const mysqlStore = MySQLStore(session);
const sessionStore = new mysqlStore({
  host: process.env.DATABASE_HOST || "127.0.0.1",
  port: parseInt(process.env.DATABASE_PORT) || 3306,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

// building router
const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  admin,
  {
    authenticate,
    cookieName: "vimaljewellers",
    cookiePassword: "sessionsecret",
  },
  null,
  {
    store: sessionStore,
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET_KEY || "fallback_secret_key_123",
    cookie: {
      maxAge: 86400000,
    },
  },
);
app.use(admin.options.rootPath, adminRouter);
app.use(bodyParser.json());

const PORT = process.env.PORT || 7503;

app.listen(PORT, () => {
  console.log(
    `🚀 Vimal Jewellers Admin Panel running at http://localhost:${PORT} `,
  );
});
