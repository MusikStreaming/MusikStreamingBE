import express from "express";
import { storage } from "@/middlewares/multer.config";
import { AuthController } from "./controller";

const router = express.Router();

router.post("/signup", storage.single("file"), AuthController.signUpWithEmail);

router.post("/signin", AuthController.signInWithEmail);

router.get("/oauth/", AuthController.signInWithGoogle);

router.post("/credentials", AuthController.updateUserCredentials);

router.get("/signout", AuthController.signOut);

export { router as authRoutes };
