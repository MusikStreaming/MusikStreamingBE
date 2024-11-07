import zalo from "@/services/zalopay";
import { Request, Response } from "express";

const createZaloOrder = async (req: Request, res: Response) => {
  const { userid, items, amount } = req.body;
  try {
    const data = await zalo.createOrder(userid, items, amount);
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
