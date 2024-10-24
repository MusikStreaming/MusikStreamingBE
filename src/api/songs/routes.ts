import express, { Router } from "express";
import controller from "./controller";

const router = Router();

router.get("/");

router.get("/presigned/:op/:fileName", async (req, res) => {
  await controller.interactBlobStorage(req, res);
});

router.post("/");

export { router as songRoutes };
