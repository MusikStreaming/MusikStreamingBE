import express from "express";
import {
  getAllUsers,
  getUserByID,
  signIn,
  signUp,
  signInWithGoogle,
} from "./controller";

const router = express.Router();

router.get("/", async (req, res) => {
  await getAllUsers(req, res);
});

router.get("/:id", async (req, res) => {
  await getUserByID(req, res);
});

router.post("/auth/signup", async (req, res) => {
  await signUp(req, res);
});

router.post("/auth/signin", async (req, res) => {
  await signIn(req, res);
});

router.get("/oauth/signin", async (req, res) => {
  await signInWithGoogle(req, res);
});

export { router as userRoutes };
