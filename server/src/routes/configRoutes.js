import express from "express";
import { getConfig, updateConfig } from "../controllers/configController.js";
import {
  getAllProblemStatements,
  createProblemStatement,
  updateProblemStatement,
  getAllProblemTitles,
  createCustomProblemStatement,
  getMyCustomProblemStatement,
} from "../controllers/problemController.js";
import { authenticateToken, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Config routes
router.get("/config", getConfig);
router.put("/config", adminOnly, updateConfig);

// Problem statement routes (public access for viewing)
router.get("/problems", getAllProblemStatements);
router.get("/problems/titles", getAllProblemTitles);

// Admin-only problem statement management
router.post("/problems", authenticateToken, adminOnly, createProblemStatement);
router.put("/problems/:id", authenticateToken, adminOnly, updateProblemStatement);

// User-specific custom problem statements (require authentication)
router.post("/problems/custom", authenticateToken, createCustomProblemStatement);
router.get("/problems/my-custom", authenticateToken, getMyCustomProblemStatement);

export default router;
