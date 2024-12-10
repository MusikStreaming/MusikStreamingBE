import zalo from "@/services/zalopay";
import { Request, RequestHandler, Response } from "express";

/**
 * Create Zalo order
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example POST /api/payment/checkout
 */
const createZaloOrder: RequestHandler = async (req: Request, res: Response) => {
  const { userid, items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "Items array cannot be empty" });
    return;
  }

  if (
    !items.every(
      (item) =>
        Object.hasOwn(item, "itemname") &&
        typeof item.itemname === "string" &&
        item.itemname.trim() !== "" &&
        Object.hasOwn(item, "itemprice") &&
        typeof item.itemprice === "number" &&
        item.itemprice > 0 &&
        Object.hasOwn(item, "itemquantity") &&
        typeof item.itemquantity === "number" &&
        item.itemquantity > 0,
    )
  ) {
    res.status(400).json({ error: "Invalid items format or values" });
    return;
  }
  try {
    const data = await zalo.createOrder(userid, items);
    res.status(200).json(data);
    return;
  } catch (err) {
    res.status(500).json({ error: err });
    return;
  }
};

/**
 * Receive Zalo order callback
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example POST /api/payment/checkkout/callback
 */
const receiveZaloCallback: RequestHandler = (req: Request, res: Response) => {
  const { data, mac } = req.body;
  try {
    const result = zalo.receiveOrderCallback(data, mac);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

/**
 * Get Zalo order status
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example POST /api/payment/1b26c1ea-6d6d-43eb-8b3c-4faf828050ca
 */
const getZaloOrderStatus: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const id = req.params.id;
  try {
    const result = await zalo.getOrderStatus(id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

const PaymentController = {
  createZaloOrder,
  receiveZaloCallback,
  getZaloOrderStatus,
};

export { PaymentController };
