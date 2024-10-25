import express from "express";
import controller from "./controller";

const router = express.Router();

router.get("/", async (req, res) => {
  await controller.getAllUsers(req, res);
});

router.get("/profile", async (req, res) => {
  await controller.getUserProfile(req, res);
});

router.post("/auth/signup", async (req, res) => {
  await controller.signUpWithEmail(req, res);
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
