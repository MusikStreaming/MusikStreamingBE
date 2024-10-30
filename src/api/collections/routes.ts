import express, { Router } from "express";
import controller from "./controller";

const router = Router();

router.get("/");
router.get("/playlists", controller.getAllPlaylists);
router.get("/albums", controller.getAllAlbums);
router.get("/:id", controller.getCollectionByID);

router.post("/");

router.post("/:id/songs"); // Add songs to playlist

router.delete("/:id/songs/:songId"); // Delete song from playlist

router.patch("/:id"); // Update playlist metadata

router.delete("/:id"); // Delete playlist

export { router as collectionRoutes };
