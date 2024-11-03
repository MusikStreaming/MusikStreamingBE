import express, { Router } from "express";
import controller from "./controller";
import { ratelimit } from "@/middlewares/rate-limit.config";
import { storage } from "@/middlewares/multer.config";

const router = Router();

router.get("/", controller.getAllArtists);

router.get("/:id", controller.getArtistByID);

router.post("/", storage.single("file"), controller.addArtist);

router.post("/:id", storage.single("file"), controller.updateArtist);

router.delete("/:id", controller.deleteArtist);

export { router as artistRoutes };
