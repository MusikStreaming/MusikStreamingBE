import express from "express";
import controller from "./controller";
import { storage } from "@/multer.config";

const router = express.Router();

router.get("/", async (req, res) => {
  await controller.getAllUsers(req, res);
});

router.get("/profile", async (req, res) => {
  await controller.getUserProfile(req, res);
});

router.post("/auth/signup", storage.single("file"), async (req, res) => {
  await controller.signUpWithEmailForm(req, res);
});

router.post("/auth/signin", async (req, res) => {
  await controller.signInWithEmail(req, res);
});

router.get("/oauth/signin", async (req, res) => {
  await controller.signInWithGoogle(req, res);
});

router.patch("/", async (req, res) => {
  await controller.updateUser(req, res);
});

export { router as userRoutes };
