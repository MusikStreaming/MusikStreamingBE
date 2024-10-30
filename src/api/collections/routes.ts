import express, { Router } from "express";
import controller from "./controller";

const router = Router();

router.get("/");
router.get("/playlists", controller.getAllPlaylists);
router.get("/albums", controller.getAllAlbums);
router.get("/:id", controller.getCollectionByID);

router.post("/");

router.post("/:id/songs");

router.delete("/:id/songs/:songId");

router.patch("/:id");

router.delete("/:id");

export { router as collectionRoutes };
