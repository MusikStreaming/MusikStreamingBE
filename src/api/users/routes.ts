import express from "express";
import controller from "./controller";

const router = express.Router();

router.get("/", async (req, res) => {
  await controller.getAllUsers(req, res);
});

router.get("/:id", async (req, res) => {
  await controller.getUserByID(req, res);
});

router.post("/auth/signup", async (req, res) => {
  await controller.signUp(req, res);
});

router.post("/auth/signin", async (req, res) => {
  await controller.signIn(req, res);
});

router.get("/oauth/signin", async (req, res) => {
  await controller.signInWithGoogle(req, res);
});

export { router as userRoutes };
