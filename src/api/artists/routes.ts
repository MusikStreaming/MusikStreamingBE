import express, { Router } from "express";

const router = Router();

router.get("/");

router.post("/");

router.post("/:id/upload");

router.patch("/:id");

router.delete("/:id");

export { router as artistRoutes };
