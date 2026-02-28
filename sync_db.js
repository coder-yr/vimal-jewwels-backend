import createDatabaseReference from "./modules/config/db_helper.js";

const db = createDatabaseReference();

async function syncDb() {
    try {
        console.log("Syncing database...");
        await db.sequelize.sync({ force: true }); // force: true will create all new tables
        console.log("Database synced successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error syncing database:", error);
        process.exit(1);
    }
}

syncDb();
