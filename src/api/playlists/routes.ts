import express, { Router } from "express";
import { cloudinary } from "@/services/cloudinary";

const router = Router();

router.get("/");

router.post("/");

export { router as playlistRoutes };
