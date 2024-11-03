import express, { Router } from "express";
import controller from "./controller";
import { storage } from "@/middlewares/multer.config";

const router = Router();

// Query collections
router.get("/", controller.getAllCollections);
router.get("/playlists", controller.getAllPlaylists);
router.get("/albums", controller.getAllAlbums);
router.get("/:id", controller.getCollectionByID);

// Add/Remove collection
router.post("/", storage.single("file"), controller.addCollection);
router.post("/:id", storage.single("file"), controller.updateCollection);
router.delete("/:id", controller.deleteCollection);

// Add/Remove songs from collection
router.post("/:id/songs/:songid", controller.addCollectionSong);
router.delete("/:id/songs/:songid", controller.deleteCollectionSong);

export { router as collectionRoutes };
