import express from "express";
import { storage } from "@/middlewares/multer.config";
import { AuthController } from "@/controllers/auth.controller";

const router = express.Router();

router.post("/signup", storage.single("file"), AuthController.signUpWithEmail);

router.post("/signin", AuthController.signInWithEmail);

router.get("/oauth/", AuthController.signInWithGoogle);

router.post("/session/renew", AuthController.renewSession);

router.get("/oauth/callback", AuthController.handleOAuthCallback);

router.post("/credentials", AuthController.updateUserCredentials);

router.get("/signout", AuthController.signOut);

export { router as AuthRoutes };
