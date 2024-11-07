import zalo from "@/services/zalopay";
import { Request, Response } from "express";

const createZaloOrder = async (req: Request, res: Response) => {
  const { userid, items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Items array cannot be empty" });
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
    return res.status(400).json({ error: "Invalid items format or values" });
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

const receiveZaloCallback = (req: Request, res: Response) => {
  const { data, mac } = req.body;
  const result = zalo.receiveOrderCallback(data, mac);
  res.json(result);
};

const getZaloOrderStatus = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const result = await zalo.getOrderStatus(id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export default { createZaloOrder, receiveZaloCallback, getZaloOrderStatus };
