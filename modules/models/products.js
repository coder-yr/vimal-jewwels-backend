/* eslint-disable import/no-anonymous-default-export */
import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "products",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      images: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "categories",
          key: "id",
        },
      },
      collectionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "collections",
          key: "id",
        },
      },
      metalRateId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "metal_rates",
          key: "id",
        },
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      trendingOrder: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      listingOrder: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      mrp: {
        type: DataTypes.REAL,
        allowNull: true,
        defaultValue: 0,
      },
      price: {
        type: DataTypes.REAL,
        allowNull: true,
        defaultValue: 0,
      },
      shortcode: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      sizes: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],

        /**
         * size,color,active and their inventory count
         */
      },

      sizeChart: {
        type: DataTypes.JSON,
      },
      taxRate: {
        type: DataTypes.REAL,
        defaultValue: 5,
      },
      isNewArrival: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      otherDetails: {
        type: DataTypes.JSON,
      },
      makingCharges: {
        type: DataTypes.REAL,
        allowNull: true,
        defaultValue: 0,
      },

      // Custom fields for rich metadata
      productSummary: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      metalWeight: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      grossWeight: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      metalDetails: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      diamondDetails: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      availableMetals: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: "Array of metal options: [{id, name, badge}]"
      },
      availableDiamonds: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: "Array of diamond options: [{id, name, badge}]"
      },
      priceBreakup: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: "Array of price components: [{label, amount, original}]"
      },

      /**
       * isGifting
       */
    },
    {
      tableName: "products",
      paranoid: true,
      omitNull: true,
      freezeTableName: true,
      indexes: [
        { fields: ["slug"] },
        { fields: ["price"] },
        { fields: ["categoryId"] },
        { fields: ["collectionId"] },
        { fields: ["active", "listingOrder"] }, // Composite index for default sorting
        { fields: ["isNewArrival"] }
      ]
    }
  );
};
