import express from "express";
import controller from "./controller";

const router = express.Router();

router.post("/signup", controller.signUpWithEmail);

router.post("/signin", controller.signInWithEmail);

router.get("/oauth/", controller.signInWithGoogle);

router.patch("/credentials", controller.updateUserCredentials);

router.get("/signout", controller.signOut);

export { router as authRoutes };
