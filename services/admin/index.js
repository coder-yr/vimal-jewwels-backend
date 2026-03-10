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
      resource: db.coupons,
      options: {
        navigation: {
          name: "Catalog",
          icon: "ShoppingBag",
        },
        properties: {
          discountType: {
            availableValues: [
              { value: "FLAT", label: "Flat Amount" },
              { value: "PERCENTAGE", label: "Percentage %" },
            ],
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
      resource: db.returnRequests,
      options: {
        navigation: {
          name: "Inquiries",
          icon: "RotateCcw",
        },
        listProperties: [
          "id",
          "orderId",
          "userId",
          "images",
          "reason",
          "status",
          "createdAt",
        ],
        filterProperties: ["status", "orderId", "userId"],
        showProperties: [
          "id",
          "orderId",
          "userId",
          "reason",
          "comments",
          "images",
          "status",
          "createdAt",
        ],
        editProperties: ["status", "comments"],
        properties: {
          images: {
            components: {
              list: components.ViewMultipleImages,
              show: components.ViewMultipleImages,
            },
          },
          comments: { type: "textarea", label: "Comments" },
          status: {
            availableValues: [
              { value: "Pending", label: "Pending" },
              { value: "Under Review", label: "Under Review" },
              { value: "Approved", label: "Approved" },
              { value: "Rejected", label: "Rejected" },
              { value: "Item Received", label: "Item Received" },
              { value: "Refund Processed", label: "Refund Processed" },
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
            isVisible: {
              list: false,
              filter: false,
              show: false,
              edit: false,
            },
          },
          globalMaterials: {
            label: "Materials",
            isVisible: { list: true, filter: true, show: true, edit: true },
            type: "reference",
            reference: "global_materials",
            isArray: true,
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
              diamondRate: { type: "string", label: "Rate per Carat (Rs)" },
              diamondWeight: { type: "string", label: "Weight (Carats)" },
            },
          },
          priceBreakup: {
            type: "mixed",
            isArray: true,
            label: "Price Breakup (Auto-Calculated)",
            isVisible: {
              list: false,
              filter: false,
              show: false,
              edit: false,
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

              return request;
            },
            after: async (response, request, context) => {
              const record = response.record;

              if (record && record.params.id) {
                try {
                  const payload = request.payload || {};

                  // Helper to extract array from flattened keys OR direct array
                  const extractArray = (prefix, fields = ["key", "value"]) => {
                    if (payload[prefix]) {
                      let data = payload[prefix];
                      if (typeof data === "string") {
                        try { data = JSON.parse(data); } catch (e) { }
                      }
                      if (Array.isArray(data)) {
                        return data.map((item) => {
                          const newItem = {};
                          fields.forEach((f) => { if (item[f] !== undefined) newItem[f] = item[f]; });
                          return newItem;
                        });
                      }
                    }

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
                        if (val !== undefined) { item[field] = val; hasData = true; }
                      });
                      if (hasData) items.push(item);
                    }
                    return items;
                  };

                  const summaryItems = extractArray("productSummary", ["key", "value"]);
                  const detailItems = extractArray("productDetails", ["key", "value"]);
                  const metalItems = extractArray("availableMetals", ["id", "name", "badge", "metalRateId", "metalWeight"]);
                  const diamondItems = extractArray("availableDiamonds", ["id", "name", "badge", "diamondRate", "diamondWeight"]);

                  const pToUpdate = {};
                  if (summaryItems.length > 0) pToUpdate.productSummary = summaryItems;
                  if (detailItems.length > 0) pToUpdate.productDetails = detailItems;
                  if (metalItems.length > 0) pToUpdate.availableMetals = metalItems;
                  if (diamondItems.length > 0) pToUpdate.availableDiamonds = diamondItems;

                  if (Object.keys(pToUpdate).length > 0) {
                    await db.products.update(pToUpdate, { where: { id: record.params.id } });
                  }

                  // --- MANUAL SAVE GLOBAL MATERIALS ---
                  let globalMaterialIds = [];
                  if (payload.globalMaterials) {
                    if (Array.isArray(payload.globalMaterials)) {
                      globalMaterialIds = payload.globalMaterials;
                    } else if (typeof payload.globalMaterials === "object") {
                      globalMaterialIds = Object.values(payload.globalMaterials);
                    }
                  } else {
                    Object.keys(payload).forEach((key) => {
                      if (key.startsWith("globalMaterials.")) {
                        globalMaterialIds.push(payload[key]);
                      }
                    });
                  }

                  const gmIds = globalMaterialIds.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));
                  const productInstance = await db.products.findByPk(record.params.id);
                  if (productInstance) {
                    await productInstance.setGlobalMaterials(gmIds);
                  }
                } catch (err) {
                  console.error("Error in product.new.after:", err);
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

              }
              return request;
            },
            after: async (response, request, context) => {
              const record = response.record;

              // --- MANUAL POPULATE ON GET (Edit View) ---
              if (request.method.toLowerCase() === "get" && record && record.params.id) {
                try {
                  const p = await db.products.findByPk(record.params.id);
                  if (p) {
                    if (p.productDetails && Array.isArray(p.productDetails)) {
                      record.params["productDetails"] = p.productDetails;
                      p.productDetails.forEach((item, i) => {
                        record.params[`productDetails.${i}.key`] = item.key;
                        record.params[`productDetails.${i}.value`] = item.value;
                      });
                    }
                    if (p.productSummary && Array.isArray(p.productSummary)) {
                      record.params["productSummary"] = p.productSummary;
                      p.productSummary.forEach((item, i) => {
                        record.params[`productSummary.${i}.key`] = item.key;
                        record.params[`productSummary.${i}.value`] = item.value;
                      });
                    }
                    if (p.availableMetals && Array.isArray(p.availableMetals)) {
                      p.availableMetals.forEach((item, i) => {
                        record.params[`availableMetals.${i}.id`] = item.id;
                        record.params[`availableMetals.${i}.name`] = item.name;
                        record.params[`availableMetals.${i}.badge`] = item.badge;
                        record.params[`availableMetals.${i}.metalRateId`] = item.metalRateId;
                        record.params[`availableMetals.${i}.metalWeight`] = item.metalWeight;
                      });
                    }
                    if (p.availableDiamonds && Array.isArray(p.availableDiamonds)) {
                      p.availableDiamonds.forEach((item, i) => {
                        record.params[`availableDiamonds.${i}.id`] = item.id;
                        record.params[`availableDiamonds.${i}.name`] = item.name;
                        record.params[`availableDiamonds.${i}.badge`] = item.badge;
                        record.params[`availableDiamonds.${i}.diamondRate`] = item.diamondRate;
                        record.params[`availableDiamonds.${i}.diamondWeight`] = item.diamondWeight;
                      });
                    }
                  }
                  const product = await db.products.findByPk(record.params.id, {
                    include: [{ model: db.globalMaterials, as: "globalMaterials", through: { attributes: [] } }],
                  });
                  if (product && product.globalMaterials && product.globalMaterials.length > 0) {
                    const gms = product.globalMaterials.map((m) => m.toJSON());
                    record.populated = record.populated || {};
                    gms.forEach((m, i) => {
                      record.params[`globalMaterials.${i}`] = m.id;
                      record.populated[`globalMaterials.${i}`] = m;
                    });
                  }
                } catch (err) {
                  console.error("Error manual populating global materials in edit:", err);
                }
              }

              // --- MANUAL SAVE ON POST ---
              if (record && record.params.id && request.method.toLowerCase() === "post") {
                try {
                  const payload = request.payload || {};
                  const extractArray = (prefix, fields = ["key", "value"]) => {
                    if (payload[prefix] && Array.isArray(payload[prefix])) {
                      return payload[prefix].map((item) => {
                        const newItem = {};
                        fields.forEach((f) => { if (item[f] !== undefined) newItem[f] = item[f]; });
                        return newItem;
                      });
                    }
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
                        if (val !== undefined) { item[field] = val; hasData = true; }
                      });
                      if (hasData) items.push(item);
                    }
                    return items;
                  };

                  const summaryItems = extractArray("productSummary", ["key", "value"]);
                  const detailItems = extractArray("productDetails", ["key", "value"]);
                  const metalItems = extractArray("availableMetals", ["id", "name", "badge", "metalRateId", "metalWeight"]);
                  const diamondItems = extractArray("availableDiamonds", ["id", "name", "badge", "diamondRate", "diamondWeight"]);
                  const pToUpdate = {};
                  if (summaryItems.length > 0) pToUpdate.productSummary = summaryItems;
                  if (detailItems.length > 0) pToUpdate.productDetails = detailItems;
                  if (metalItems.length > 0) pToUpdate.availableMetals = metalItems;
                  if (diamondItems.length > 0) pToUpdate.availableDiamonds = diamondItems;

                  if (Object.keys(pToUpdate).length > 0) {
                    await db.products.update(pToUpdate, { where: { id: record.params.id } });
                  }

                  // --- MANUAL SAVE GLOBAL MATERIALS ---
                  let globalMaterialIds = [];
                  if (payload.globalMaterials !== undefined) {
                    if (Array.isArray(payload.globalMaterials)) {
                      globalMaterialIds = payload.globalMaterials;
                    } else if (typeof payload.globalMaterials === "object" && payload.globalMaterials !== null) {
                      globalMaterialIds = Object.values(payload.globalMaterials);
                    }
                  } else {
                    Object.keys(payload).forEach((key) => {
                      if (key.startsWith("globalMaterials.")) { globalMaterialIds.push(payload[key]); }
                    });
                  }
                  const gmIds = globalMaterialIds.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));
                  const productInstanceEdit = await db.products.findByPk(record.params.id);
                  if (productInstanceEdit) {
                    await productInstanceEdit.setGlobalMaterials(gmIds);
                  }
                } catch (err) {
                  console.error("Error manual saving JSON fields/materials in edit:", err);
                }
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
                  // --- MANUAL POPULATE GLOBAL MATERIALS ---
                  const productGM = await db.products.findByPk(record.params.id, {
                    include: [
                      {
                        model: db.globalMaterials,
                        as: "globalMaterials",
                        through: { attributes: [] },
                      },
                    ],
                  });

                  if (
                    productGM &&
                    productGM.globalMaterials &&
                    productGM.globalMaterials.length > 0
                  ) {
                    const gms = productGM.globalMaterials.map((m) => m.toJSON());
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
          "storeSectionBg",
        ],
        newProperties: [
          "sparkleSeekerConfig.title",
          "sparkleSeekerConfig.description",
          "sparkleSeekerConfig.buttonText",
          "storeSectionBg",
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
          storeSectionBg: {
            label: "Store Section Background (Discover the magic)",
            components: {
              new: components.UploadSingleImage,
              edit: components.UploadSingleImage,
              show: components.ViewSingleImage,
            },
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
    "🚀 Vimal Jewellers Admin Panel running at https://admin.vimaljewellers.com",
  );
});
