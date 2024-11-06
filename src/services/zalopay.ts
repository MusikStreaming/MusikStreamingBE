import { ZaloClientInfo, ZaloOrderInfo } from "@/models/interfaces";
import axios from "axios";
import { randomUUID } from "crypto";
import moment from "moment";
import CryptoJS from "crypto-js";

class Zalo {
  private readonly client: ZaloClientInfo;

  constructor() {
    this.client = {
      app_id: process.env.ZALO_APP_ID || "2553",
      key1: process.env.ZALO_KEY1 || "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
      key2: process.env.ZALO_KEY2 || "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
      embed_data: {
        redirecturl: "https://developer.hustmusik.live",
      },
    };
  }

  public createOrder = async (user_id: string, items: any, amount: number) => {
    const orderID = randomUUID();
    const order: ZaloOrderInfo = {
      app_id: this.client.app_id,
      app_trans_id: `${moment().format("YYMMDD")}_${orderID}`,
      app_user: user_id,
      app_time: Date.now(),
      item: JSON.stringify([]),
      embed_data: JSON.stringify(this.client.embed_data),
      amount: amount,
      description: `Hust Musik Premium - Payment for order ${orderID}`,
      bank_code: "zalopayapp",
    };
    const data =
      this.client.app_id +
      "|" +
      order.app_trans_id +
      "|" +
      order.app_user +
      "|" +
      order.amount +
      "|" +
      order.app_time +
      "|" +
      order.embed_data +
      "|" +
      order.item;
    order.mac = CryptoJS.HmacSHA256(data, this.client.key1).toString();

    try {
      const data = await axios.post(
        "https://sb-openapi.zalopay.vn/v2/create",
        null,
        { params: order },
      );
      console.log(data.data);
      return data.data;
    } catch (err) {
      console.log(err);
    }
  };
}

const zalo = new Zalo();

export default zalo;
