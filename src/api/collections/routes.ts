import { Router } from "express";
import { storage } from "@/middlewares/multer.config";
import { CollectionController } from "./controller";

const router = Router();

// Query collections
router.get("/", CollectionController.getAllCollections);
router.get("/playlists", CollectionController.getAllPlaylists);
router.get("/albums", CollectionController.getAllAlbums);
router.get("/:id", CollectionController.getCollectionByID);

// Add/Remove collection
router.post("/", storage.single("file"), CollectionController.addCollection);
router.post(
  "/:id",
  storage.single("file"),
  CollectionController.updateCollection,
);
router.delete("/:id", CollectionController.deleteCollection);

// Add/Remove songs from collection
router.post("/:id/songs/:songid", CollectionController.addCollectionSong);
router.delete("/:id/songs/:songid", CollectionController.deleteCollectionSong);

export { router as CollectionRoutes };
