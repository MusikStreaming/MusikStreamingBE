import { SearchController } from "@/controllers/search.controller";
import { Router } from "express";

const router = Router();

router.get("/:term", SearchController.searchDefault);

router.get("/:term/songs", SearchController.searchSongs);

router.get("/:term/artists", SearchController.searchArtists);

router.get("/:term/albums", SearchController.searchAlbums);

router.get("/:term/playlists", SearchController.searchPlaylists);

router.get("/:term/users", SearchController.searchUsers);

export { router as SearchRoutes };
