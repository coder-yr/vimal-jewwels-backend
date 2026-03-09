import express from "express";
const router = express.Router();
import db from "../db.js";

// GET /api/reviews/product/:productId
// Get all active reviews for a specific product
router.get("/product/:productId", async (req, res) => {
    try {
        const reviews = await db.reviews.findAll({
            where: {
                productId: req.params.productId,
                active: true
            },
            order: [["createdAt", "DESC"]]
        });

        // Parse images json string if needed
        const parsedReviews = reviews.map(r => {
            const reviewData = r.toJSON();
            if (typeof reviewData.images === 'string') {
                try {
                    reviewData.images = JSON.parse(reviewData.images);
                } catch (e) {
                    reviewData.images = [];
                }
            }
            return reviewData;
        });

        res.status(200).json(parsedReviews);
    } catch (err) {
        console.error("Error fetching reviews:", err);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
});

// POST /api/reviews/product/:productId
// Create a new review for a product
router.post("/product/:productId", async (req, res) => {
    try {
        const { userName, rating, comment, images } = req.body;
        const { productId } = req.params;

        // Optional: Validate product exists
        const product = await db.products.findByPk(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const newReview = await db.reviews.create({
            productId,
            userName,
            rating: parseInt(rating) || 5,
            comment,
            images: images || [], // images should be an array of filenames/URLs passed from frontend after upload
        });

        res.status(201).json({ message: "Review created successfully", review: newReview });
    } catch (err) {
        console.error("Error creating review:", err);
        res.status(500).json({ error: "Failed to create review" });
    }
});

// DELETE /api/reviews/:reviewId
// Delete a specific review
router.delete("/:reviewId", async (req, res) => {
    try {
        // We could either hard delete or soft delete
        const review = await db.reviews.findByPk(req.params.reviewId);
        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        // Hard Delete
        await review.destroy();

        res.status(200).json({ message: "Review deleted successfully" });
    } catch (err) {
        console.error("Error deleting review:", err);
        res.status(500).json({ error: "Failed to delete review" });
    }
});

export default router;
