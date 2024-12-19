export interface User {
  id: string;
  role: "Anonymous" | "User" | "Artist Manager" | "Admin";
}

export interface JWTPayload {
  sub: string;
  exp: number;
  user_metadata: {
    role: string;
  };
}

export interface SanitizeOptions {
  type: "number" | "string" | "boolean";
  defaultValue: any;
  min?: number;
  max?: number;
  allowedValues?: any[];
}

export interface ZaloOrder {
  app_id: string;
  app_trans_id: string;
  app_user?: string;
  app_time?: number;
  item?: any;
  embed_data?: any;
  amount?: number;
  description?: string;
  bank_code?: string;
  mac?: string;
  callback_url?: string;
}

export interface ZaloClient {
  app_id: string;
  key1: string;
  key2: string;
  embed_data?: {
    redirectUrl?: string;
  };
}

export interface ZaloResult {
  return_code: number;
  return_message: string;
}

export interface OrderItem {
  itemname: string;
  itemprice: number;
  itemquantity: number;
}
