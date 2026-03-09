import db from './services/backend/db.js';

async function syncDatabase() {
    console.log("🔄 Starting database synchronization...");
    try {
        // This will create the table if it doesn't exist and alter it if there are column mismatches
        await db.sequelize.sync({ alter: true });
        console.log("✅ Database synchronized and tables created successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error synchronizing database:", error);
        process.exit(1);
    }
}

syncDatabase();
