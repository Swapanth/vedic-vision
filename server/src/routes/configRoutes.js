import express from "express";
import { getConfig, updateConfig } from "../controllers/configController.js";
import {
  getAllProblemStatements,
  createProblemStatement,
  updateProblemStatement,
  getAllProblemTitles,
} from "../controllers/problemController.js";

const router = express.Router();

// Config routes
router.get("/config", getConfig);
router.put("/config", updateConfig);

// Problem statement routes
router.get("/problems", getAllProblemStatements);
router.get("/problems/titles", getAllProblemTitles);
router.post("/problems", createProblemStatement);
router.put("/problems/:id", updateProblemStatement);

export default router;
