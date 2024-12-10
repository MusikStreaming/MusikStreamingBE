import { PaymentController } from "@/controllers/payment.controller";
import { Router } from "express";

const router = Router();

router.post("/checkout", PaymentController.createZaloOrder);

router.post("/checkout/callback", PaymentController.receiveZaloCallback);

router.post("/:id", PaymentController.getZaloOrderStatus);

export { router as PaymentRoutes };
