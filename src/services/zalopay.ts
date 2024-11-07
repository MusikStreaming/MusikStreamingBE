import { ZaloResult, ZaloClient, ZaloOrder } from "@/models/interfaces";
import axios from "axios";
import { randomUUID } from "crypto";
import moment from "moment";
import CryptoJS from "crypto-js";
import QueryString from "qs";

// Sandbox env
class Zalo {
  private readonly client: ZaloClient;
  private orderID: number = 100000;

  constructor() {
    this.client = {
      app_id: process.env.ZALO_APP_ID!,
      key1: process.env.ZALO_KEY1!,
      key2: process.env.ZALO_KEY2!,
      embed_data: {
        redirecturl: "<some-page>, will update later",
      },
    };
  }

  public createOrder = async (user_id: string, items: any, amount: number) => {
    this.orderID++;
    const order: ZaloOrder = {
      app_id: this.client.app_id,
      app_trans_id: `${moment().format("YYMMDD")}_${this.orderID}`,
      app_user: user_id,
      app_time: Date.now(),
      item: JSON.stringify(items),
      embed_data: JSON.stringify(this.client.embed_data),
      amount: amount,
      description: `Hust Musik Premium - Payment for order ${this.orderID}`,
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

    const res = await axios.post(
      "https://sb-openapi.zalopay.vn/v2/create",
      null,
      { params: order },
    );
    return { ...res.data, app_trans_id: order.app_trans_id };
  };

  public receiveOrderCallback = (
    dataStr: string,
    reqMac: string,
  ): ZaloResult => {
    let result: ZaloResult;
    try {
      let mac = CryptoJS.HmacSHA256(dataStr, this.client.key2).toString();

      if (reqMac !== mac) {
        result = {
          return_code: -1,
          return_message: "mac not equal",
        };
      } else {
        result = {
          return_code: 1,
          return_message: "success",
        };
      }
    } catch (err) {
      result = {
        return_code: 0,
        return_message: (err as any).message,
      };
    }
    return result;
  };

  public getOrderStatus = async (app_trans_id: string) => {
    const order: ZaloOrder = {
      app_id: this.client.app_id,
      app_trans_id: app_trans_id,
    };
    const data =
      order.app_id + "|" + order.app_trans_id + "|" + this.client.key1;
    order.mac = CryptoJS.HmacSHA256(data, this.client.key1).toString();

    const config = {
      method: "post",
      url: "https://sb-openapi.zalopay.vn/v2/query",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: QueryString.stringify(order),
    };

    const resp = await axios(config);
    return resp.data;
  };
}

const zalo = new Zalo();

export default zalo;
