
import express from 'express';
import db from '../db.js';

const router = express.Router();

// Create Appointment
router.post('/', async (req, res) => {
    try {
        const { name, phone, email, date, time, message } = req.body;

        if (!name || !phone || !date || !time) {
            return res.status(400).json({ error: "Name, Phone, Date and Time are required." });
        }

        const appointment = await db.appointments.create({
            name,
            phone,
            email,
            date,
            time,
            message,
            status: 'New'
        });

        res.status(201).json(appointment);
    } catch (error) {
        console.error("Error creating appointment:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get Appointments (Admin/Optional)
router.get('/', async (req, res) => {
    try {
        const appointments = await db.appointments.findAll({ order: [['createdAt', 'DESC']] });
        res.json(appointments);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
