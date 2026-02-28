import express from "express";
import db from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }
  try {
    const existingUser = await db.users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered." });
    }
    const existingUsername = await db.users.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(409).json({ error: "Username already taken." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.users.create({ username, email, password: hashedPassword });
    res.status(201).json({ message: "Signup successful", user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: "Signup failed." });
  }
});

// POST /api/auth/signin
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  try {
    const user = await db.users.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ message: "Signin successful", token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: "Signin failed." });
  }
});

export default router;
