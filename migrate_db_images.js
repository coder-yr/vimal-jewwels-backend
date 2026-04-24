import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load .env from the admin service directory
dotenv.config({ path: './services/admin/.env' });

async function migrateImages() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl: {
        rejectUnauthorized: false
    }
  });

  try {
    const [products] = await connection.execute('SELECT id, images FROM products WHERE images IS NOT NULL AND images != ""');
    console.log(`Found ${products.length} products to check.`);

    let updatedCount = 0;
    for (const product of products) {
      const originalImages = product.images;
      if (!originalImages) continue;

      // Replace old domain absolute URLs with relative paths
      // Also handle case where it might already be the new domain
      let updatedImages = originalImages.replace(/https:\/\/backend\.vimaljewellers\.com\/images\//g, '/images/');
      // Also handle the current Render URL if it was accidentally saved
      updatedImages = updatedImages.replace(/https:\/\/vimal-jewwels-backend-q7iv\.onrender\.com\/images\//g, '/images/');

      if (updatedImages !== originalImages) {
        await connection.execute('UPDATE products SET images = ? WHERE id = ?', [updatedImages, product.id]);
        updatedCount++;
        console.log(`Updated Product ID ${product.id}`);
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} products.`);
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await connection.end();
  }
}

migrateImages();
