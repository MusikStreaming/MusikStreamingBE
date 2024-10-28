import express, { Router } from "express";
import controller from "./controller";

const router = Router();

router.get("/playlists", controller.getAllPlaylists);

router.get("/albums", controller.getAllAlbums);

export { router as playlistRoutes };
