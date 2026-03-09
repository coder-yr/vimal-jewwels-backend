import express from "express";
const router = express.Router();
import db from "../db.js";
import { transformImageUrl } from "../utils/imageHelper.js";

// GET /api/home - Get home page data
router.get("/", async (req, res) => {
  try {
    const [
      bannersRaw,
      subBannersRaw,
      categoriesRaw,
      collections,
      sectionImagesRaw,
      gifts,
      videosRaw,
      homeRows
    ] = await Promise.all([
      db.banners.findAll({ where: { active: true } }),
      db.subBanners.findAll({ where: { active: true } }),
      db.categories.findAll(),
      db.collections.findAll(),
      db.sectionImages.findAll(),
      db.homeGifts.findAll(),
      db.videos.findAll({ where: { active: true } }),
      db.home.findAll({ order: [["updatedAt", "DESC"], ["id", "DESC"]] })
    ]);

    // Prefer a row that actually has store section background configured.
    // Some deployments have multiple rows in home_data, and a plain findOne()
    // can select an older/incomplete row.
    const homeDataRaw =
      homeRows.find((row) => {
        const value = row?.storeSectionBg;
        return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
      }) || homeRows[0] || null;

    const banners = bannersRaw.map(b => ({ ...b.toJSON(), image: transformImageUrl(b.image) }));
    const subBanners = subBannersRaw.map(b => ({ ...b.toJSON(), image: transformImageUrl(b.image) }));
    const categories = categoriesRaw.map(c => ({ ...c.toJSON(), image: transformImageUrl(c.image) }));
    const sectionImages = sectionImagesRaw.map(s => ({ ...s.toJSON(), image: transformImageUrl(s.image) }));
    const videos = videosRaw.map(v => {
      const vid = v.toJSON();
      if (vid.videoFile) {
        vid.videoFile = transformImageUrl(vid.videoFile);
      }
      return vid;
    });

    const homeData = homeDataRaw ? {
      ...homeDataRaw.toJSON(),
      otherBannerImage: transformImageUrl(homeDataRaw.otherBannerImage),
      giftSectionBg: transformImageUrl(homeDataRaw.giftSectionBg),
      storeSectionBg: transformImageUrl(homeDataRaw.storeSectionBg)
    } : null;

    res.json({
      banners,
      subBanners,
      categories,
      collections,
      sectionImages,
      gifts,
      videos,
      homeData
    });
  } catch (error) {
    console.error("Error fetching home data:", error);
    res.status(500).json({ message: "Error fetching home data" });
  }
});

export default router;
