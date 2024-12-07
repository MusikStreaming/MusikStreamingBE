import { Router } from "express";
import { PaymentController } from "./controller";

const router = Router();

router.post("/checkout", PaymentController.createZaloOrder);

router.post("/checkout/callback", PaymentController.receiveZaloCallback);

router.post("/:id", PaymentController.getZaloOrderStatus);

export { router as paymentRoutes };
