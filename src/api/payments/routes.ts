import { Router } from "express";
import controller from "./controller";

const router = Router();

router.post("/checkout", controller.createZaloOrder);

router.post("/checkout/callback", controller.receiveZaloCallback);

router.post("/:id", controller.getZaloOrderStatus);

export { router as paymentRoutes };
