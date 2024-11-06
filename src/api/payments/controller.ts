import zalo from "@/services/zalopay";
import { Request, Response } from "express";

const createZaloOrder = async (req: Request, res: Response) => {
  const data = await zalo.createOrder("1", [{}], 5000);
  res.json({ data });
};

export default { createZaloOrder };
