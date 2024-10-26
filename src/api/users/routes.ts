import express from "express";
import controller from "./controller";
import { storage } from "@/multer.config";

const router = express.Router();

router.get("/", controller.getAllUsers);

router.get("/profile", controller.getUserProfile);

router.post(
  "/auth/signup",
  storage.single("file"),
  controller.signUpWithEmailForm,
);

router.post("/auth/signin", controller.signInWithEmail);

router.get("auth/oauth/", controller.signInWithGoogle);

router.patch("/", controller.updateUser);

export { router as userRoutes };
