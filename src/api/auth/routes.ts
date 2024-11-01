import express from "express";
import controller from "./controller";
import { storage } from "@/middlewares/multer.config";

const router = express.Router();

router.post("/signup", storage.single("file"), controller.signUpWithEmail);

router.post("/signin", controller.signInWithEmail);

router.get("/oauth/", controller.signInWithGoogle);

router.post("/credentials", controller.updateUserCredentials);

router.get("/signout", controller.signOut);

export { router as authRoutes };
