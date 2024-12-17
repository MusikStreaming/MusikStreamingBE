import { Router } from "express";
import { storage } from "@/middlewares/multer.config";
import { ArtistController } from "@/controllers/artist.controller";
import {userMiddleware} from "@/middlewares/user.config";

const router = Router();

router.get("/", userMiddleware, ArtistController.getAllArtists);

router.get("/:id", ArtistController.getArtistByID);

router.get("/:id/songs", ArtistController.getArtistSongsByID);

router.get("/:id/albums", ArtistController.getArtistAlbumsByID);

router.post("/", storage.single("file"), ArtistController.addArtist);

router.post("/:id", storage.single("file"), ArtistController.updateArtist);

router.delete("/:id", ArtistController.deleteArtist);

export { router as ArtistRoutes };
