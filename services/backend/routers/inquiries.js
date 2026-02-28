
import express from 'express';
import db from '../db.js';

const router = express.Router();

// Create Inquiry (Chat/Call request)
router.post('/', async (req, res) => {
    try {
        const { name, phone, email, message, type } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ error: "Name and Phone are required." });
        }

        const inquiry = await db.inquiries.create({
            name,
            phone,
            email,
            message,
            type: type || 'Chat',
            status: 'New'
        });

        res.status(201).json(inquiry);
    } catch (error) {
        console.error("Error creating inquiry:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get Inquiries (Admin/Optional)
router.get('/', async (req, res) => {
    try {
        const inquiries = await db.inquiries.findAll({ order: [['createdAt', 'DESC']] });
        res.json(inquiries);
    } catch (error) {
        console.error("Error fetching inquiries:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
