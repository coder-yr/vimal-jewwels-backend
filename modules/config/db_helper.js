import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import banners from "../models/banners.js";
import users from "../models/users.js";
import orders from "../models/orders.js";
import categories from "../models/categories.js";
import collections from "../models/collections.js";
import megaCategories from "../models/mega_categories.js";
import home from "../models/home.js";
import products from "../models/products.js";
import runningList from "../models/runningList.js";
import materials from "../models/materials.js";
import occasions from "../models/occasions.js";
import shopFor from "../models/shopFor.js";
import styles from "../models/styles.js";
import subBanners from "../models/sub_banners.js";
import adminLogs from "../models/admin_logs.js";
import wishlist from "../models/wishlist.js";
import sectionImages from "../models/section_images.js";
import homeGifts from "../models/home_gifts.js";
import metalRates from "../models/metal_rates.js";
import productMaterials from "../models/product_materials.js";
import globalMaterials from "../models/global_materials.js";
import productGlobalMaterials from "../models/product_global_materials.js";
import videos from "../models/videos.js";
import pages from "../models/pages.js";
import settings from '../models/settings.js';
import appointments from '../models/appointments.js';
import inquiries from '../models/inquiries.js';
import footerConfig from '../models/footer_config.js';

// CREATEs A DATABASE CONNECTION AND INSTANCE
const createDatabaseReference = () => {
  dotenv.config();
  const sequelize = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USER,
    process.env.DATABASE_PASSWORD,
    {
      host: process.env.DATABASE_HOST,
      dialect: "mysql",
      port: process.env.DATABASE_PORT || 3306,
      dialectOptions: {
        connectTimeout: 10000,
        ssl: process.env.DATABASE_SSL === 'true' ? {
          require: true,
          rejectUnauthorized: false
        } : undefined
      },
      pool: {
        max: 50,
        min: 10,
        acquire: 30000,
        idle: 20000,
        evict: 10000
      },
      logging: false,
      retry: {
        max: 3
      }
    }
  );
  // CREATE COMMON DB INSTANCE
  const db = {
    sequelize: sequelize,
    banners: banners(sequelize),
    subBanners: subBanners(sequelize),
    megaCategories: megaCategories(sequelize),
    styles: styles(sequelize),
    materials: materials(sequelize),
    shopFor: shopFor(sequelize),
    occasions: occasions(sequelize),
    home: home(sequelize),
    products: products(sequelize),
    runningList: runningList(sequelize),
    categories: categories(sequelize),
    collections: collections(sequelize),
    orders: orders(sequelize),
    users: users(sequelize),
    adminLogs: adminLogs(sequelize, Sequelize.DataTypes),
    wishlist: wishlist(sequelize),
    sectionImages: sectionImages(sequelize),
    homeGifts: homeGifts(sequelize),
    metalRates: metalRates(sequelize),
    productMaterials: productMaterials(sequelize),
    globalMaterials: globalMaterials(sequelize),
    productGlobalMaterials: productGlobalMaterials(sequelize),
    videos: videos(sequelize),
    pages: pages(sequelize),
    settings: settings(sequelize),
    appointments: appointments(sequelize),
    inquiries: inquiries(sequelize),
    footerConfigs: footerConfig(sequelize),
  };

  // MAPPINGs
  db.megaCategories.hasMany(db.styles, {
    as: "styles",
    foreignKey: "megaCategoryId",
  });
  db.styles.belongsTo(db.megaCategories, {
    as: "styleMegaCategory",
    foreignKey: "megaCategoryId",
  });
  db.megaCategories.hasMany(db.materials, {
    as: "materials",
    foreignKey: "megaCategoryId",
  });
  db.materials.belongsTo(db.megaCategories, {
    as: "materialMegaCategory",
    foreignKey: "megaCategoryId",
  });
  db.megaCategories.hasMany(db.shopFor, {
    as: "shopFors",
    foreignKey: "megaCategoryId",
  });
  db.shopFor.belongsTo(db.megaCategories, {
    as: "shopForMegaCategory",
    foreignKey: "megaCategoryId",
  });
  db.megaCategories.hasMany(db.occasions, {
    as: "occassions",
    foreignKey: "megaCategoryId",
  });
  db.occasions.belongsTo(db.megaCategories, {
    as: "occasionMegaCategory",
    foreignKey: "megaCategoryId",
  });

  db.megaCategories.hasMany(db.categories, {
    as: "categories",
    foreignKey: "megaCategoryId",
  });
  db.categories.belongsTo(db.megaCategories, {
    as: "megaCategory",
    foreignKey: "megaCategoryId",
  });

  db.categories.hasMany(db.products, {
    as: "products",
    foreignKey: "categoryId",
  });
  db.products.belongsTo(db.categories, {
    as: "productCategory",
    foreignKey: "categoryId",
  });
  db.collections.hasMany(db.products, {
    as: "products",
    foreignKey: "collectionId",
  });
  db.products.belongsTo(db.collections, {
    as: "productCollection",
    foreignKey: "collectionId",
  });

  // Many-to-Many Relationship: Products <-> Materials
  db.products.belongsToMany(db.materials, {
    through: db.productMaterials,
    as: 'materials',
    foreignKey: 'productId'
  });
  db.materials.belongsToMany(db.products, {
    through: db.productMaterials,
    as: 'products',
    foreignKey: 'materialId'
  });

  // Many-to-Many Relationship: Products <-> GlobalMaterials
  db.products.belongsToMany(db.globalMaterials, {
    through: db.productGlobalMaterials,
    as: 'globalMaterials',
    foreignKey: 'productId',
    otherKey: 'globalMaterialId'
  });
  db.globalMaterials.belongsToMany(db.products, {
    through: db.productGlobalMaterials,
    as: 'products',
    foreignKey: 'globalMaterialId',
    otherKey: 'productId'
  });

  // Product -> Metal Rate
  db.products.belongsTo(db.metalRates, {
    as: "metalRate",
    foreignKey: "metalRateId",
  });


  return db;
};

export default createDatabaseReference;
