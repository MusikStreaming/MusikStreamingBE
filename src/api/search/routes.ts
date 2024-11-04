import { Router } from "express";
import controller from "./controller";

const router = Router();

router.get("/:term", controller.searchDefault);

router.get("/:term/songs", controller.searchSongs);

router.get("/:term/artists", controller.searchArtists);

router.get("/:term/albums", controller.searchAlbums);

router.get("/:term/playlists", controller.searchPlaylists);

router.get("/:term/users", controller.searchUsers);

export { router as searchRoutes };
