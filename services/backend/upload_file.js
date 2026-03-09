import express from "express";
import multer from "multer";
import path, { join, dirname } from "path";
import { fileURLToPath } from "url";

//creating router
const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import fs from "fs";

// Configure multer for file storage
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(__dirname, "images");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const currentTimeMs = Date.now();
    const filename = `${currentTimeMs}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

/////////////////////////// IMAGES ///////////////////
router.post("/upload/image", (req, res, next) => {
  uploadImage.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File too large. Maximum size is 5MB." });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(500).json({ message: "Upload failed", error: err.message });
    }
    next();
  });
}, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    // Get the filename
    const uploadedFileName = req.file.filename;
    res
      .status(200)
      .json({ message: "Image Uploaded", filename: uploadedFileName });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

// Configure multer for video storage
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(__dirname, "images");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const currentTimeMs = Date.now();
    cb(null, `${currentTimeMs}${path.extname(file.originalname)}`);
  },
});

const uploadVideo = multer({ storage: videoStorage });

router.post("/upload/video", uploadVideo.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const uploadedFileName = req.file.filename;
    res
      .status(200)
      .json({ message: "Video Uploaded", filename: uploadedFileName });
  } catch (error) {
    return res.status(500).json({ message: "Video upload failed" });
  }
});

///////////base route ///////////
router.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

export { uploadImage };
export default router;